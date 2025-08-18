import { Request, Response } from 'express';
import Course from '../models/course.model';
import { isValidObjectId } from 'mongoose';

// Get courses created by the instructor
export const getInstructorCourses = async (req: Request, res: Response) => {
    try {
        const courses = await Course.find({ instructor: req.user._id })
            .populate('instructor', 'name email')
            .select('-modules.quiz.questions.correctAnswer');
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching instructor courses', error });
    }
};

// Create a new course with modules
export const createCourse = async (req: Request, res: Response) => {
    try {
        const { title, description, level, tags, modules } = req.body;

        // Validate modules structure
        if (!modules || !Array.isArray(modules)) {
            return res.status(400).json({ message: 'Modules must be an array' });
        }

        // Generate unique IDs for modules and quiz questions
        const processedModules = modules.map((module: any, index: number) => ({
            ...module,
            id: `module_${Date.now()}_${index}`,
            order: index,
            quiz: module.quiz ? {
                ...module.quiz,
                questions: module.quiz.questions.map((q: any, qIndex: number) => ({
                    ...q,
                    id: `question_${Date.now()}_${qIndex}`
                }))
            } : undefined
        }));

        const course = new Course({
            title,
            description,
            level,
            instructor: req.user._id,
            tags,
            modules: processedModules,
            status: 'draft'
        });

        const savedCourse = await course.save();
        res.status(201).json(savedCourse);
    } catch (error) {
        res.status(400).json({ message: 'Error creating course', error });
    }
};

// Update course details and modules
export const updateCourse = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const updates = req.body;

        // Validate course ownership
        const course = await Course.findOne({
            _id: courseId,
            instructor: req.user._id
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found or unauthorized' });
        }

        // If updating modules, process them
        if (updates.modules) {
            updates.modules = updates.modules.map((module: any, index: number) => ({
                ...module,
                id: module.id || `module_${Date.now()}_${index}`,
                order: index,
                quiz: module.quiz ? {
                    ...module.quiz,
                    questions: module.quiz.questions.map((q: any, qIndex: number) => ({
                        ...q,
                        id: q.id || `question_${Date.now()}_${qIndex}`
                    }))
                } : undefined
            }));
        }

        const updatedCourse = await Course.findByIdAndUpdate(
            courseId,
            { $set: updates },
            { new: true }
        ).populate('instructor', 'name email');

        res.status(200).json(updatedCourse);
    } catch (error) {
        res.status(400).json({ message: 'Error updating course', error });
    }
};

// Delete a course
export const deleteCourse = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;

        // Validate course ownership
        const course = await Course.findOne({
            _id: courseId,
            instructor: req.user._id
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found or unauthorized' });
        }

        await Course.findByIdAndDelete(courseId);
        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting course', error });
    }
};

// Update course module content
export const updateModuleContent = async (req: Request, res: Response) => {
    try {
        const { courseId, moduleId } = req.params;
        const { content, quiz } = req.body;

        // Validate course ownership
        const course = await Course.findOne({
            _id: courseId,
            instructor: req.user._id
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found or unauthorized' });
        }

        // Find and update the specific module
        const moduleIndex = course.modules.findIndex(m => m.id === moduleId);
        if (moduleIndex === -1) {
            return res.status(404).json({ message: 'Module not found' });
        }

        // Update module content
        if (content) {
            course.modules[moduleIndex].content = content;
        }

        // Update quiz if provided
        if (quiz) {
            course.modules[moduleIndex].quiz = {
                ...quiz,
                questions: quiz.questions.map((q: any, index: number) => ({
                    ...q,
                    id: q.id || `question_${Date.now()}_${index}`
                }))
            };
        }

        await course.save();
        res.status(200).json(course.modules[moduleIndex]);
    } catch (error) {
        res.status(400).json({ message: 'Error updating module content', error });
    }
};

// Publish or unpublish a course
export const toggleCourseStatus = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;
        const { status } = req.body;

        if (!['draft', 'published', 'archived'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        // Validate course ownership
        const course = await Course.findOne({
            _id: courseId,
            instructor: req.user._id
        });

        if (!course) {
            return res.status(404).json({ message: 'Course not found or unauthorized' });
        }

        // Update course status
        course.status = status;
        await course.save();

        res.status(200).json({ message: `Course ${status} successfully`, course });
    } catch (error) {
        res.status(500).json({ message: 'Error updating course status', error });
    }
};
