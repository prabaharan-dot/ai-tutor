import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Container, Box, Paper } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import authService from '../../services/auth.service';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            await authService.register(formData.name, formData.email, formData.password);
            navigate('/courses');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            // Load the Google Sign-In API script dynamically
            const script = document.createElement('script');
            script.src = 'https://accounts.google.com/gsi/client';
            script.async = true;
            script.defer = true;
            document.head.appendChild(script);

            script.onload = () => {
                // Initialize Google Sign-In
                window.google.accounts.id.initialize({
                    client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
                    callback: async (response: any) => {
                        try {
                            // Send the token to your backend
                            await authService.googleLogin(response.credential);
                            navigate('/courses');
                        } catch (err: any) {
                            setError(err.response?.data?.message || 'Google login failed');
                        }
                    },
                });

                // Render the Google Sign-In button
                window.google.accounts.id.prompt();
            };
        } catch (err: any) {
            setError('Google login failed');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        Register
                    </Typography>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Confirm Password"
                            name="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            margin="normal"
                            required
                        />
                        {error && (
                            <Typography color="error" align="center" sx={{ mt: 2 }}>
                                {error}
                            </Typography>
                        )}
                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            color="primary"
                            sx={{ mt: 3 }}
                        >
                            Register
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<GoogleIcon />}
                            onClick={handleGoogleLogin}
                            sx={{ mt: 2 }}
                        >
                            Register with Google
                        </Button>
                    </form>
                    <Box sx={{ mt: 2 }}>
                        <Typography align="center">
                            Already have an account?{' '}
                            <Button onClick={() => navigate('/login')}>
                                Login
                            </Button>
                        </Typography>
                    </Box>
                </Paper>
            </Box>
        </Container>
    );
};

export default Register;
│   │   │   ├── courses
│   │   │   │   ├── CourseList.tsx
│   │   │   │   └── CourseDetails.tsx
│   │   │   ├── quiz
│   │   │   │   ├── QuizComponent.tsx
│   │   │   │   └── Results.tsx
│   │   │   └── Leaderboard.tsx
│   │   ├── services
│   │   │   ├── auth.service.ts
│   │   │   └── api.service.ts
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json
│   └── tsconfig.json
├── server
│   ├── src
│   │   ├── controllers
│   │   │   ├── auth.controller.ts
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