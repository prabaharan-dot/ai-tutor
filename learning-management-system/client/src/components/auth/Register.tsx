import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Typography, Container, Box, Paper, CircularProgress } from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import authService, { RegisterData } from '../../services/auth.service';

// Define Google Sign-In types
declare global {
    interface Window {
        google: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                    }) => void;
                    prompt: () => void;
                    renderButton: (element: HTMLElement, config: any) => void;
                };
            };
        };
    }
}

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<RegisterData & { confirmPassword: string }>({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student'
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [googleScriptLoaded, setGoogleScriptLoaded] = useState(false);

    useEffect(() => {
        // Cleanup function to remove any existing Google Sign-In scripts
        return () => {
            const script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
            if (script) {
                script.remove();
            }
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            const { confirmPassword, ...registerData } = formData;
            await authService.register(registerData);
            navigate('/courses');
        } catch (err: any) {
            setError(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        if (!process.env.REACT_APP_GOOGLE_CLIENT_ID) {
            setError('Google Sign-In is not configured');
            return;
        }

        try {
            if (!googleScriptLoaded) {
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.defer = true;
                script.onload = () => {
                    setGoogleScriptLoaded(true);
                    initializeGoogleSignIn();
                };
                document.head.appendChild(script);
            } else {
                initializeGoogleSignIn();
            }
        } catch (err: any) {
            setError('Google login failed');
        }
    };

    const initializeGoogleSignIn = () => {
        window.google?.accounts.id.initialize({
            client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID!,
            callback: async (response) => {
                try {
                    setIsLoading(true);
                    await authService.googleLogin(response.credential);
                    navigate('/courses');
                } catch (err: any) {
                    setError(err.message || 'Google login failed');
                } finally {
                    setIsLoading(false);
                }
            },
        });

        window.google?.accounts.id.prompt();
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
                            label="Username"
                            name="username"
                            value={formData.username}
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
                            disabled={isLoading}
                        >
                            {isLoading ? <CircularProgress size={24} /> : 'Register'}
                        </Button>
                        <Button
                            fullWidth
                            variant="outlined"
                            startIcon={<GoogleIcon />}
                            onClick={handleGoogleLogin}
                            sx={{ mt: 2 }}
                            disabled={isLoading}
                        >
                            Register with Google
                        </Button>
                    </form>
                    <Box sx={{ mt: 2 }}>
                        <Typography align="center">
                            Already have an account?{' '}
                            <Button 
                                onClick={() => navigate('/login')}
                                disabled={isLoading}
                            >
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