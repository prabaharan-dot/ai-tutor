import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Container,
    Button,
    Box,
    CssBaseline,
    ThemeProvider,
    createTheme,
} from '@mui/material';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import CourseList from './components/courses/CourseList';
import CourseDetails from './components/courses/CourseDetails';
import QuizComponent from './components/quiz/QuizComponent';
import Results from './components/quiz/Results';
import Leaderboard from './components/Leaderboard';
import CourseCreator from './components/courses/CourseCreator';
import CourseManagement from './components/courses/CourseManagement';

// Create theme
const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
});

const App: React.FC = () => {
    const isAuthenticated = !!localStorage.getItem('user');

    const handleLogout = () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    };

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <Box sx={{ flexGrow: 1 }}>
                    <AppBar position="static">
                        <Toolbar>
                            <Typography variant="h6" sx={{ flexGrow: 1 }}>
                                Learning Platform
                            </Typography>
                            {isAuthenticated ? (
                                <>
                                    <Button color="inherit" component={Link} to="/courses">
                                        Courses
                                    </Button>
                                    <Button color="inherit" component={Link} to="/course-management">
                                        Manage Courses
                                    </Button>
                                    <Button color="inherit" component={Link} to="/leaderboard">
                                        Leaderboard
                                    </Button>
                                    <Button color="inherit" onClick={handleLogout}>
                                        Logout
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Button color="inherit" href="/login">
                                        Login
                                    </Button>
                                    <Button color="inherit" href="/register">
                                        Register
                                    </Button>
                                </>
                            )}
                        </Toolbar>
                    </AppBar>
                    <Container>
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    isAuthenticated ? (
                                        <Navigate to="/courses" />
                                    ) : (
                                        <Navigate to="/login" />
                                    )
                                }
                            />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route
                                path="/courses"
                                element={
                                    isAuthenticated ? (
                                        <CourseList />
                                    ) : (
                                        <Navigate to="/login" />
                                    )
                                }
                            />
                            <Route
                                path="/courses/:courseId"
                                element={
                                    isAuthenticated ? (
                                        <CourseDetails />
                                    ) : (
                                        <Navigate to="/login" />
                                    )
                                }
                            />
                            <Route
                                path="/courses/:courseId/modules/:moduleId/quiz"
                                element={
                                    isAuthenticated ? (
                                        <QuizComponent />
                                    ) : (
                                        <Navigate to="/login" />
                                    )
                                }
                            />
                            <Route
                                path="/courses/:courseId/modules/:moduleId/quiz/results"
                                element={
                                    isAuthenticated ? (
                                        <Results />
                                    ) : (
                                        <Navigate to="/login" />
                                    )
                                }
                            />
                            <Route
                                path="/leaderboard"
                                element={
                                    isAuthenticated ? (
                                        <Leaderboard />
                                    ) : (
                                        <Navigate to="/login" />
                                    )
                                }
                            />
                            <Route
                                path="/courses/:courseId/leaderboard"
                                element={
                                    isAuthenticated ? (
                                        <Leaderboard />
                                    ) : (
                                        <Navigate to="/login" />
                                    )
                                }
                            />
                            <Route
                                path="/course-management"
                                element={
                                    isAuthenticated ? (
                                        <CourseManagement />
                                    ) : (
                                        <Navigate to="/login" />
                                    )
                                }
                            />
                            <Route
                                path="/courses/create"
                                element={
                                    isAuthenticated ? (
                                        <CourseCreator />
                                    ) : (
                                        <Navigate to="/login" />
                                    )
                                }
                            />
                            <Route
                                path="/courses"
                                element={
                                    isAuthenticated ? (
                                        <CourseList />
                                    ) : (
                                        <Navigate to="/login" />
                                    )
                                }
                            />
                            <Route
                                path="/courses/:courseId"
                                element={
                                    isAuthenticated ? (
                                        <CourseDetails />
                                    ) : (
                                        <Navigate to="/login" />
                                    )
                                }
                            />
                            <Route
                                path="/courses/:courseId/modules/:moduleId/quiz"
                                element={
                                    isAuthenticated ? (
                                        <QuizComponent moduleId="" questions={[]} onComplete={() => {}} />
                                    ) : (
                                        <Navigate to="/login" />
                                    )
                                }
                            />
                            <Route
                                path="/courses/:courseId/modules/:moduleId/results"
                                element={
                                    isAuthenticated ? (
                                        <Results />
                                    ) : (
                                        <Navigate to="/login" />
                                    )
                                }
                            />
                            <Route
                                path="/leaderboard"
                                element={
                                    isAuthenticated ? (
                                        <Leaderboard />
                                    ) : (
                                        <Navigate to="/login" />
                                    )
                                }
                            />
                        </Routes>
                    </Container>
                </Box>
            </Router>
        </ThemeProvider>
    );
};

export default App;
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