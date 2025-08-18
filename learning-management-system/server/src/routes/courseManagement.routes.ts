import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { isInstructor } from '../middleware/role.middleware';
import {
    getInstructorCourses,
    createCourse,
    updateCourse,
    deleteCourse,
    updateModuleContent,
    toggleCourseStatus
} from '../controllers/courseManagement.controller';

const router = Router();

// All routes require authentication and instructor role
router.use(authMiddleware);
router.use(isInstructor);

// Course management routes
router.get('/instructor/courses', getInstructorCourses);
router.post('/courses', createCourse);
router.put('/courses/:courseId', updateCourse);
router.delete('/courses/:courseId', deleteCourse);
router.put('/courses/:courseId/modules/:moduleId', updateModuleContent);
router.put('/courses/:courseId/status', toggleCourseStatus);

export default router;
