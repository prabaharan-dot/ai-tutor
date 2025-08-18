import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';

export const isInstructor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || user.role !== 'instructor') {
            return res.status(403).json({ message: 'Access denied. Instructor role required.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error checking user role', error });
    }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin role required.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Error checking user role', error });
    }
};
