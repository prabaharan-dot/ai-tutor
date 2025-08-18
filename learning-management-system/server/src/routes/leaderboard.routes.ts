import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
    getGlobalLeaderboard,
    getCourseLeaderboard,
    getUserRanking
} from '../controllers/leaderboard.controller';

const router = Router();

// Leaderboard routes
router.get('/leaderboard', getGlobalLeaderboard);
router.get('/leaderboard/courses/:courseId', getCourseLeaderboard);
router.get('/leaderboard/ranking', authMiddleware, getUserRanking);
router.get('/leaderboard/courses/:courseId/ranking', authMiddleware, getUserRanking);

export default router;
