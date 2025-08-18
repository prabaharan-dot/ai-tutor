import express from 'express';
import { register, login, googleLogin } from '../controllers/auth.controller';
import { body } from 'express-validator';

const router = express.Router();

// Validation middleware
const registerValidation = [
    body('name').trim().not().isEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').not().isEmpty().withMessage('Password is required'),
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/google', googleLogin);

export default router;
│   │   │   ├── course.routes.ts
│   │   │   └── quiz.routes.ts
│   │   ├── middleware
│   │   │   └── auth.middleware.ts
│   │   └── app.ts
│   ├── package.json
│   └── tsconfig.json
└── README.md