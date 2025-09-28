import { Request, Response } from 'express';
import { Types } from 'mongoose';
import Course, { ICourse, IModule } from '../models/course.model';
import User, { IUser } from '../models/user.model';

interface CourseProgress {
    courseId: Types.ObjectId;
    completedModules: string[];
    currentModule: number;
    lastAccessed: Date;
    quizScores: {
        moduleId: string;
        score: number;
    }[];
}

interface UserProgress {
    completedModules: number;
    totalModules: number;
    progressPercentage: number;
    lastAccessed: Date | null;
    currentModule: number;
}

interface CourseResponse {
    course: ICourse;
    userProgress?: UserProgress | null;
    isEnrolled: boolean;
    metadata: {
        createdAt: Date;
        updatedAt: Date;
        enrollmentCount: number;
        moduleCount: number;
        hasQuizzes: boolean;
        estimatedDuration: number;
    };
}

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
            .populate('instructor', 'username email')
            .populate('enrolledStudents', 'username');

        if (!course) {
            return res.status(404).json({ 
                message: 'Course not found',
                details: 'The requested course does not exist or has been deleted'
            });
        }

        // Prepare response object
        const response: any = { course };

        // If user is authenticated, include their progress and enrollment status
        if (req.user) {
            const user = await User.findById(req.user._id).select('enrolledCourses progress');
            if (user) {
                const progress = user.progress.find(
                    p => p.courseId.toString() === course._id.toString()
                );
                
                const isEnrolled = user.enrolledCourses.some(
                    courseId => courseId.toString() === course._id.toString()
                );

                // Calculate progress percentage
                const totalModules = course.modules.length;
                const completedModules = progress?.completedModules?.length || 0;
                const progressPercentage = totalModules > 0 
                    ? Math.round((completedModules / totalModules) * 100)
                    : 0;

                // If user is not enrolled, hide sensitive content
                if (!isEnrolled) {
                    course.modules = course.modules.map(module => ({
                        ...module,
                        quiz: module.quiz ? {
                            ...module.quiz,
                            questions: module.quiz.questions.map(q => ({
                                ...q,
                                correctAnswer: undefined
                            }))
                        } : undefined,
                        content: module.content.substring(0, 300) + '... (Enroll to view full content)'
                    }));
                }

                response.userProgress = {
                    completedModules,
                    totalModules,
                    progressPercentage,
                    lastAccessed: progress?.lastAccessed || null,
                    currentModule: progress?.currentModule || 0
                };
                response.isEnrolled = isEnrolled;
            }
        } else {
            // For non-authenticated users, hide sensitive content
            course.modules = course.modules.map(module => ({
                ...module,
                quiz: module.quiz ? {
                    timeLimit: module.quiz.timeLimit,
                    questionCount: module.quiz.questions.length
                } : undefined,
                content: module.content.substring(0, 300) + '... (Login and enroll to view full content)'
            }));
            
            response.isEnrolled = false;
            response.userProgress = null;
        }

        // Add metadata
        response.metadata = {
            createdAt: course.createdAt,
            updatedAt: course.updatedAt,
            enrollmentCount: course.enrolledStudents.length,
            moduleCount: course.modules.length,
            hasQuizzes: course.modules.some(m => m.quiz),
            estimatedDuration: course.modules.reduce((acc, m) => acc + (m.estimatedDuration || 0), 0)
        };

        res.status(200).json(response);
    } catch (error: any) {
        res.status(500).json({ 
            message: 'Error fetching course',
            details: error.message,
            code: error.code || 'INTERNAL_SERVER_ERROR'
        });
    }
};

interface CreateCourseBody {
    title: string;
    description: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    modules: {
        title: string;
        content: string;
        order: number;
        quiz?: {
            questions: {
                text: string;
                options: { text: string; isCorrect: boolean }[];
            }[];
            timeLimit: number;
        };
    }[];
}

// Create a new course
export const createCourse = async (req: Request, res: Response) => {
    try {
        const courseData = req.body as CreateCourseBody;
        
        // Validate required fields
        if (!courseData.title || !courseData.description || !courseData.level) {
            return res.status(400).json({
                message: 'Missing required fields',
                details: {
                    title: !courseData.title ? 'Title is required' : null,
                    description: !courseData.description ? 'Description is required' : null,
                    level: !courseData.level ? 'Level is required' : null
                }
            });
        }

        // Validate level
        if (!['beginner', 'intermediate', 'advanced'].includes(courseData.level)) {
            return res.status(400).json({
                message: 'Invalid course level',
                details: 'Level must be one of: beginner, intermediate, advanced'
            });
        }

        // Validate and sort modules
        if (courseData.modules?.length > 0) {
            // Check for duplicate order numbers
            const orders = courseData.modules.map(m => m.order);
            if (new Set(orders).size !== orders.length) {
                return res.status(400).json({
                    message: 'Invalid module order',
                    details: 'Module order numbers must be unique'
                });
            }

            // Sort modules by order
            courseData.modules.sort((a, b) => a.order - b.order);

            // Validate quiz data if present
            for (const module of courseData.modules) {
                if (module.quiz) {
                    if (!module.quiz.timeLimit || module.quiz.timeLimit < 1) {
                        return res.status(400).json({
                            message: 'Invalid quiz configuration',
                            details: `Quiz in module "${module.title}" must have a valid time limit`
                        });
                    }

                    if (!module.quiz.questions || module.quiz.questions.length === 0) {
                        return res.status(400).json({
                            message: 'Invalid quiz configuration',
                            details: `Quiz in module "${module.title}" must have at least one question`
                        });
                    }

                    // Validate each question has correct options
                    module.quiz.questions.forEach((question, index) => {
                        if (!question.options || question.options.length < 2) {
                            return res.status(400).json({
                                message: 'Invalid quiz configuration',
                                details: `Question ${index + 1} in module "${module.title}" must have at least 2 options`
                            });
                        }

                        const correctOptions = question.options.filter((opt: { isCorrect: boolean }) => opt.isCorrect);
                        if (correctOptions.length !== 1) {
                            return res.status(400).json({
                                message: 'Invalid quiz configuration',
                                details: `Question ${index + 1} in module "${module.title}" must have exactly one correct answer`
                            });
                        }
                    });
                }
            }
        }

        // Add instructor from authenticated user
        const newCourse = new Course({
            ...courseData,
            instructor: req.user!._id,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        const savedCourse = await newCourse.save();
        
        // Update instructor's courses list
        await User.findByIdAndUpdate(req.user!._id, {
            $push: { coursesCreated: savedCourse._id }
        });

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