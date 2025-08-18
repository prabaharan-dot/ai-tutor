import { Request, Response } from 'express';
import User from '../models/user.model';
import Course from '../models/course.model';

// Get global leaderboard
export const getGlobalLeaderboard = async (req: Request, res: Response) => {
    try {
        const users = await User.find({})
            .select('name totalScore enrolledCourses progress')
            .sort({ totalScore: -1 })
            .limit(100);

        const leaderboard = users.map((user, index) => ({
            rank: index + 1,
            userId: user._id,
            name: user.name,
            totalScore: user.totalScore,
            coursesCompleted: user.progress.filter(p => {
                const course = user.enrolledCourses.find(c => c.toString() === p.courseId.toString());
                return course && p.completedModules.length > 0;
            }).length
        }));

        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching leaderboard', error });
    }
};

// Get course-specific leaderboard
export const getCourseLeaderboard = async (req: Request, res: Response) => {
    try {
        const { courseId } = req.params;

        // Verify course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Get all users enrolled in the course
        const users = await User.find({
            enrolledCourses: courseId
        }).select('name progress');

        // Calculate course-specific scores
        const leaderboardData = users.map(user => {
            const courseProgress = user.progress.find(p => p.courseId.toString() === courseId);
            const quizScores = courseProgress?.quizScores || [];
            const averageScore = quizScores.length > 0
                ? quizScores.reduce((acc, curr) => acc + curr.score, 0) / quizScores.length
                : 0;
            const completedModules = courseProgress?.completedModules.length || 0;
            
            return {
                userId: user._id,
                name: user.name,
                averageScore,
                completedModules,
                totalScore: (averageScore * 0.7) + ((completedModules / course.modules.length) * 30)
            };
        });

        // Sort by total score and add ranks
        const leaderboard = leaderboardData
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((entry, index) => ({
                ...entry,
                rank: index + 1
            }));

        res.status(200).json(leaderboard);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching course leaderboard', error });
    }
};

// Get user's ranking and nearby users
export const getUserRanking = async (req: Request, res: Response) => {
    try {
        const userId = req.user._id;
        const { courseId } = req.params;

        let users;
        let userRankData;

        if (courseId) {
            // Course-specific ranking
            users = await User.find({ enrolledCourses: courseId })
                .select('name progress')
                .lean();

            // Calculate course-specific scores
            const course = await Course.findById(courseId);
            if (!course) {
                return res.status(404).json({ message: 'Course not found' });
            }

            userRankData = users.map(user => {
                const courseProgress = user.progress.find(p => p.courseId.toString() === courseId);
                const quizScores = courseProgress?.quizScores || [];
                const averageScore = quizScores.length > 0
                    ? quizScores.reduce((acc, curr) => acc + curr.score, 0) / quizScores.length
                    : 0;
                const completedModules = courseProgress?.completedModules.length || 0;
                
                return {
                    userId: user._id,
                    name: user.name,
                    totalScore: (averageScore * 0.7) + ((completedModules / course.modules.length) * 30)
                };
            });
        } else {
            // Global ranking
            users = await User.find({})
                .select('name totalScore')
                .lean();

            userRankData = users.map(user => ({
                userId: user._id,
                name: user.name,
                totalScore: user.totalScore
            }));
        }

        // Sort by total score
        userRankData.sort((a, b) => b.totalScore - a.totalScore);

        // Find user's position
        const userIndex = userRankData.findIndex(u => u.userId.toString() === userId.toString());
        if (userIndex === -1) {
            return res.status(404).json({ message: 'User not found in rankings' });
        }

        // Get 5 users above and below
        const start = Math.max(0, userIndex - 5);
        const end = Math.min(userRankData.length, userIndex + 6);
        const nearbyUsers = userRankData.slice(start, end).map((user, index) => ({
            ...user,
            rank: start + index + 1
        }));

        res.status(200).json({
            userRank: userIndex + 1,
            totalUsers: userRankData.length,
            nearbyUsers
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user ranking', error });
    }
};
