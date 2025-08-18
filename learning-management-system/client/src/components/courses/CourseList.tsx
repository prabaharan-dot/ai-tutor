import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Grid,
    Card,
    CardContent,
    CardActions,
    Typography,
    Button,
    Chip,
    CircularProgress,
    Box,
    Alert,
} from '@mui/material';
import {
    School as SchoolIcon,
    Timer as TimerIcon,
    TrendingUp as LevelIcon,
} from '@mui/icons-material';
import { fetchCourses } from '../../services/api.service';

interface Course {
    _id: string;
    title: string;
    description: string;
    duration: number;
    level: 'beginner' | 'intermediate' | 'advanced';
    enrolledStudents: string[];
    tags: string[];
}

const CourseList: React.FC = () => {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getCourses = async () => {
            try {
                const data = await fetchCourses();
                setCourses(data);
            } catch (err) {
                setError('Failed to fetch courses');
            } finally {
                setLoading(false);
            }
        };

        getCourses();
    }, []);

    const getLevelColor = (level: string) => {
        switch (level) {
            case 'beginner':
                return 'success';
            case 'intermediate':
                return 'warning';
            case 'advanced':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '60vh',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Container sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Available Courses
            </Typography>
            <Grid container spacing={3}>
                {courses.map((course) => (
                    <Grid item xs={12} sm={6} md={4} key={course._id}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                },
                            }}
                        >
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h5" component="h2">
                                    {course.title}
                                </Typography>
                                <Typography
                                    color="text.secondary"
                                    sx={{
                                        mb: 2,
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {course.description}
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Chip
                                        icon={<LevelIcon />}
                                        label={course.level}
                                        color={getLevelColor(course.level) as any}
                                        size="small"
                                        sx={{ mr: 1 }}
                                    />
                                    <Chip
                                        icon={<TimerIcon />}
                                        label={`${course.duration}h`}
                                        size="small"
                                        sx={{ mr: 1 }}
                                    />
                                    <Chip
                                        icon={<SchoolIcon />}
                                        label={`${course.enrolledStudents.length} enrolled`}
                                        size="small"
                                    />
                                </Box>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {course.tags.map((tag) => (
                                        <Chip
                                            key={tag}
                                            label={tag}
                                            size="small"
                                            variant="outlined"
                                        />
                                    ))}
                                </Box>
                            </CardContent>
                            <CardActions>
                                <Button
                                    size="small"
                                    onClick={() => navigate(`/courses/${course._id}`)}
                                >
                                    Learn More
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Container>
    );
};

export default CourseList;