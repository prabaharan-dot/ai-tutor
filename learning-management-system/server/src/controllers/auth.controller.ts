import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/user.model';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            enrolledCourses: [],
            progress: []
        });

        await user.save();

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password!);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const googleLogin = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        if (!payload) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        const { email, name, sub: googleId } = payload;

        // Find or create user
        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                name,
                email,
                googleId,
                enrolledCourses: [],
                progress: []
            });
            await user.save();
        }

        // Generate JWT
        const jwtToken = jwt.sign(
            { userId: user._id },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token: jwtToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
│   │   │   ├── course.controller.ts
│   │   │   └── quiz.controller.ts
│   │   ├── models
│   │   │   ├── user.model.ts
│   │   │   ├── course.model.ts
│   │   │   └── quiz.model.ts
│   │   ├── routes
│   │   │   ├── auth.routes.ts
│   │   │   ├── course.routes.ts
│   │   │   └── quiz.routes.ts
│   │   ├── middleware
│   │   │   └── auth.middleware.ts
│   │   └── app.ts
│   ├── package.json
│   └── tsconfig.json
└── README.md