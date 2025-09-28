import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/user.model';

interface UserPayload {
    userId: string;
}

// Extend Express Request interface to include user
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error();
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as UserPayload;
        
        // Find user by id
        const user = await User.findById(decoded.userId);

        if (!user) {
            throw new Error();
        }

        // Add user to request object
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Not authorized to access this resource' });
    }
};

export default auth;
│   │   └── app.ts
│   ├── package.json
│   └── tsconfig.json
└── README.md