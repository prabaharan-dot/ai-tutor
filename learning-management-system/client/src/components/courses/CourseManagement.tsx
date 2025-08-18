import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Snackbar,
    Alert
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api.service';

interface Module {
    _id: string;
    title: string;
    description: string;
    order: number;
    content: string;
    quiz?: {
        _id: string;
        title: string;
        questions: number;
    };
}

interface Course {
    _id: string;
    title: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    status: 'draft' | 'published' | 'archived';
    enrolledStudents: string[];
    modules: Module[];
    createdAt: string;
    description?: string;
}

type StatusColor = 'success' | 'warning' | 'error' | 'default';
type AlertSeverity = 'success' | 'error' | 'warning' | 'info';

const CourseManagement: React.FC = () => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusDialog, setStatusDialog] = useState<{
        open: boolean;
        courseId: string;
        status: string;
    }>({
        open: false,
        courseId: '',
        status: ''
    });
    const [deleteDialog, setDeleteDialog] = useState<{
        open: boolean;
        courseId: string;
    }>({
        open: false,
        courseId: ''
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const navigate = useNavigate();

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await apiService.get('/instructor/courses');
            setCourses(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setLoading(false);
        }
    };

    const handleStatusChange = async () => {
        try {
            await apiService.put(`/courses/${statusDialog.courseId}/status`, {
                status: statusDialog.status
            });
            fetchCourses();
            setSnackbar({
                open: true,
                message: 'Course status updated successfully',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error updating course status',
                severity: 'error'
            });
        }
        setStatusDialog({ open: false, courseId: '', status: '' });
    };

    const handleDeleteCourse = async () => {
        try {
            await apiService.delete(`/courses/${deleteDialog.courseId}`);
            fetchCourses();
            setSnackbar({
                open: true,
                message: 'Course deleted successfully',
                severity: 'success'
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error deleting course',
                severity: 'error'
            });
        }
        setDeleteDialog({ open: false, courseId: '' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published':
                return 'success';
            case 'draft':
                return 'warning';
            case 'archived':
                return 'error';
            default:
                return 'default';
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography>Loading...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Course Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/courses/create')}
                >
                    Create New Course
                </Button>
            </Box>

            <Grid container spacing={3} mb={3}>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Total Courses</Typography>
                            <Typography variant="h4">{courses.length}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Published Courses</Typography>
                            <Typography variant="h4">
                                {courses.filter(c => c.status === 'published').length}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Total Students</Typography>
                            <Typography variant="h4">
                                {courses.reduce((acc, curr) => acc + curr.enrolledStudents.length, 0)}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Level</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Modules</TableCell>
                            <TableCell>Students</TableCell>
                            <TableCell>Created</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {courses.map((course) => (
                            <TableRow key={course._id}>
                                <TableCell>{course.title}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>
                                    <Chip
                                        label={course.status.toUpperCase()}
                                        color={getStatusColor(course.status) as any}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{course.modules.length}</TableCell>
                                <TableCell>{course.enrolledStudents.length}</TableCell>
                                <TableCell>
                                    {new Date(course.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <IconButton
                                        onClick={() => navigate(`/courses/${course._id}`)}
                                        size="small"
                                    >
                                        <ViewIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => navigate(`/courses/${course._id}/edit`)}
                                        size="small"
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => setStatusDialog({
                                            open: true,
                                            courseId: course._id,
                                            status: course.status
                                        })}
                                        size="small"
                                    >
                                        <Chip
                                            label="Status"
                                            size="small"
                                            onClick={() => {}}
                                        />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => setDeleteDialog({
                                            open: true,
                                            courseId: course._id
                                        })}
                                        size="small"
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Status Change Dialog */}
            <Dialog
                open={statusDialog.open}
                onClose={() => setStatusDialog({ open: false, courseId: '', status: '' })}
            >
                <DialogTitle>Change Course Status</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusDialog.status}
                            onChange={(e) => setStatusDialog({
                                ...statusDialog,
                                status: e.target.value
                            })}
                        >
                            <MenuItem value="draft">Draft</MenuItem>
                            <MenuItem value="published">Published</MenuItem>
                            <MenuItem value="archived">Archived</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setStatusDialog({
                            open: false,
                            courseId: '',
                            status: ''
                        })}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleStatusChange}
                    >
                        Update Status
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, courseId: '' })}
            >
                <DialogTitle>Delete Course</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete this course? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => setDeleteDialog({ open: false, courseId: '' })}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteCourse}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity as any}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default CourseManagement;
