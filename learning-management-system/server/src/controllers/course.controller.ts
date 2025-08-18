import { Request, Response } from 'express';
import Course from '../models/course.model';
import User from '../models/user.model';

// Fetch all courses with optional filtering
export const getCourses = async (req: Request, res: Response) => {
    try {
        const { level, search, tags } = req.query;
        let query: any = {};

        // Add filters if provided
        if (level) {
            query.level = level;
        }
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        if (tags) {
            query.tags = { $in: (tags as string).split(',') };
        }

        const courses = await Course.find(query)
            .populate('instructor', 'name')
            .select('-modules.quiz.questions.correctAnswer');
            
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching courses', error });
    }
};

// Fetch a single course by ID with user progress if authenticated
export const getCourseById = async (req: Request, res: Response) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('instructor', 'name')
            .populate('enrolledStudents', 'name');

        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // If user is authenticated, include their progress
        if (req.user) {
            const user = await User.findById(req.user._id);
            if (user) {
                const progress = user.progress.find(
                    p => p.courseId.toString() === course._id.toString()
                );
                
                // Calculate progress percentage
                const totalModules = course.modules.length;
                const completedModules = progress?.completedModules.length || 0;
                const progressPercentage = (completedModules / totalModules) * 100;

                // If user is not enrolled, hide quiz answers
                if (!user.enrolledCourses.includes(course._id)) {
                    course.modules.forEach(module => {
                        if (module.quiz) {
                            module.quiz.questions.forEach(question => {
                                delete question.correctAnswer;
                            });
                        }
                    });
                }

                return res.status(200).json({
                    course,
                    progress: progress || null,
                    progressPercentage,
                    isEnrolled: user.enrolledCourses.includes(course._id)
                });
            }
        }

        // If not authenticated, hide quiz answers
        course.modules.forEach(module => {
            if (module.quiz) {
                module.quiz.questions.forEach(question => {
                    delete question.correctAnswer;
                });
            }
        });

        res.status(200).json({ course, progress: null, isEnrolled: false });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course', error });
    }
};

// Create a new course
export const createCourse = async (req: Request, res: Response) => {
    const newCourse = new Course(req.body);
    try {
        const savedCourse = await newCourse.save();
        res.status(201).json(savedCourse);
    } catch (error) {
        res.status(400).json({ message: 'Error creating course', error });
    }
};

// Update a course
export const updateCourse = async (req: Request, res: Response) => {
    try {
        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json(updatedCourse);
    } catch (error) {
        res.status(400).json({ message: 'Error updating course', error });
    }
};

// Delete a course
export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const deletedCourse = await Course.findByIdAndDelete(req.params.id);
        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting course', error });
    }
};

// Enroll in a course
export const enrollInCourse = async (req: Request, res: Response) => {
    try {
        const courseId = req.params.id;
        const userId = req.user._id; // From auth middleware

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check if user is already enrolled
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.enrolledCourses.includes(courseId)) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // Add course to user's enrolled courses
        user.enrolledCourses.push(courseId);
        // Initialize progress tracking for the course
        user.progress.push({
            courseId,
            completedModules: [],
            quizScores: []
        });
        await user.save();

        // Add user to course's enrolled students
        course.enrolledStudents.push(userId);
        await course.save();

        res.status(200).json({ message: 'Successfully enrolled in course' });
    } catch (error) {
        res.status(500).json({ message: 'Error enrolling in course', error });
    }
};

// Update module progress
export const updateModuleProgress = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const { moduleId } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the course progress
        const courseProgress = user.progress.find(p => p.courseId.toString() === courseId);
        if (!courseProgress) {
            return res.status(404).json({ message: 'Course progress not found' });
        }

        // Add module to completed modules if not already completed
        if (!courseProgress.completedModules.includes(moduleId)) {
            courseProgress.completedModules.push(moduleId);
            await user.save();
        }

        res.status(200).json({
            message: 'Progress updated successfully',
            progress: courseProgress
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating progress', error });
    }
};

// Get course progress
export const getCourseProgress = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const courseProgress = user.progress.find(p => p.courseId.toString() === courseId);
        if (!courseProgress) {
            return res.status(404).json({ message: 'Course progress not found' });
        }

        // Get course details to calculate percentage
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const totalModules = course.modules.length;
        const completedModules = courseProgress.completedModules.length;
        const progressPercentage = (completedModules / totalModules) * 100;

        res.status(200).json({
            progress: courseProgress,
            progressPercentage,
            totalModules,
            completedModules
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching progress', error });
    }
};