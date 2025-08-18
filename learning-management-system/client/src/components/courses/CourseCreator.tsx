import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    TextField,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Alert
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, Add as AddIcon } from '@mui/icons-material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { apiService } from '../../services/api.service';

interface Module {
    id?: string;
    title: string;
    description: string;
    content: string;
    quiz?: {
        title: string;
        description: string;
        questions: Array<{
            id?: string;
            text: string;
            options: string[];
            correctAnswer: number;
        }>;
    };
}

const CourseCreator: React.FC = () => {
    const [courseData, setCourseData] = useState({
        title: '',
        description: '',
        level: 'beginner',
        tags: [] as string[],
        modules: [] as Module[]
    });
    const [currentModule, setCurrentModule] = useState<Module | null>(null);
    const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
    const [quizDialogOpen, setQuizDialogOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: 0
    });
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [editingModuleIndex, setEditingModuleIndex] = useState<number | null>(null);

    const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCourseData({ ...courseData, [e.target.name]: e.target.value });
    };

    const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const tags = e.target.value.split(',').map(tag => tag.trim());
        setCourseData({ ...courseData, tags });
    };

    const handleModuleChange = (field: string, value: string) => {
        setCurrentModule(prev => prev ? { ...prev, [field]: value } : null);
    };

    const handleAddModule = () => {
        if (!currentModule) return;
        
        const newModules = [...courseData.modules];
        if (editingModuleIndex !== null) {
            newModules[editingModuleIndex] = currentModule;
        } else {
            newModules.push(currentModule);
        }
        
        setCourseData({ ...courseData, modules: newModules });
        setCurrentModule(null);
        setEditingModuleIndex(null);
        setModuleDialogOpen(false);
    };

    const handleEditModule = (index: number) => {
        setCurrentModule(courseData.modules[index]);
        setEditingModuleIndex(index);
        setModuleDialogOpen(true);
    };

    const handleDeleteModule = (index: number) => {
        const newModules = courseData.modules.filter((_, i) => i !== index);
        setCourseData({ ...courseData, modules: newModules });
    };

    const handleQuestionChange = (field: string, value: any) => {
        setCurrentQuestion(prev => ({ ...prev, [field]: value }));
    };

    const handleAddQuestion = () => {
        if (!currentModule) return;
        
        const quiz = currentModule.quiz || {
            title: '',
            description: '',
            questions: []
        };
        
        quiz.questions = [...quiz.questions, currentQuestion];
        setCurrentModule({ ...currentModule, quiz });
        setCurrentQuestion({ text: '', options: ['', '', '', ''], correctAnswer: 0 });
    };

    const handleSaveCourse = async () => {
        try {
            const response = await apiService.post('/courses', courseData);
            setSnackbar({
                open: true,
                message: 'Course created successfully!',
                severity: 'success'
            });
            // Reset form or redirect
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Error creating course',
                severity: 'error'
            });
        }
    };

    return (
        <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
            <Typography variant="h4" gutterBottom>
                Create New Course
            </Typography>

            <Card sx={{ mb: 3 }}>
                <CardContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Course Title"
                                name="title"
                                value={courseData.title}
                                onChange={handleCourseInputChange}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Course Description"
                                name="description"
                                value={courseData.description}
                                onChange={handleCourseInputChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControl fullWidth>
                                <InputLabel>Level</InputLabel>
                                <Select
                                    name="level"
                                    value={courseData.level}
                                    onChange={handleCourseInputChange}
                                >
                                    <MenuItem value="beginner">Beginner</MenuItem>
                                    <MenuItem value="intermediate">Intermediate</MenuItem>
                                    <MenuItem value="advanced">Advanced</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Tags (comma-separated)"
                                value={courseData.tags.join(', ')}
                                onChange={handleTagsChange}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            <Card>
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                        <Typography variant="h6">Modules</Typography>
                        <Button
                            startIcon={<AddIcon />}
                            variant="contained"
                            onClick={() => {
                                setCurrentModule({
                                    title: '',
                                    description: '',
                                    content: ''
                                });
                                setEditingModuleIndex(null);
                                setModuleDialogOpen(true);
                            }}
                        >
                            Add Module
                        </Button>
                    </Box>

                    <List>
                        {courseData.modules.map((module, index) => (
                            <React.Fragment key={index}>
                                <ListItem>
                                    <ListItemText
                                        primary={module.title}
                                        secondary={module.description}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => handleEditModule(index)}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={() => handleDeleteModule(index)}>
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                </CardContent>
            </Card>

            {/* Module Dialog */}
            <Dialog
                open={moduleDialogOpen}
                onClose={() => setModuleDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {editingModuleIndex !== null ? 'Edit Module' : 'Add Module'}
                </DialogTitle>
                <DialogContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Module Title"
                                value={currentModule?.title || ''}
                                onChange={(e) => handleModuleChange('title', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                label="Module Description"
                                value={currentModule?.description || ''}
                                onChange={(e) => handleModuleChange('description', e.target.value)}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Module Content
                            </Typography>
                            <ReactQuill
                                value={currentModule?.content || ''}
                                onChange={(content) => handleModuleChange('content', content)}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setModuleDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddModule}
                        disabled={!currentModule?.title || !currentModule?.content}
                    >
                        Save Module
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Quiz Dialog */}
            <Dialog
                open={quizDialogOpen}
                onClose={() => setQuizDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>Add Quiz Question</DialogTitle>
                <DialogContent>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Question"
                                value={currentQuestion.text}
                                onChange={(e) => handleQuestionChange('text', e.target.value)}
                            />
                        </Grid>
                        {currentQuestion.options.map((option, index) => (
                            <Grid item xs={12} key={index}>
                                <TextField
                                    fullWidth
                                    label={`Option ${index + 1}`}
                                    value={option}
                                    onChange={(e) => {
                                        const newOptions = [...currentQuestion.options];
                                        newOptions[index] = e.target.value;
                                        handleQuestionChange('options', newOptions);
                                    }}
                                />
                            </Grid>
                        ))}
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Correct Answer</InputLabel>
                                <Select
                                    value={currentQuestion.correctAnswer}
                                    onChange={(e) => handleQuestionChange('correctAnswer', e.target.value)}
                                >
                                    {currentQuestion.options.map((_, index) => (
                                        <MenuItem key={index} value={index}>
                                            Option {index + 1}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setQuizDialogOpen(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleAddQuestion}
                        disabled={!currentQuestion.text || currentQuestion.options.some(opt => !opt)}
                    >
                        Add Question
                    </Button>
                </DialogActions>
            </Dialog>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveCourse}
                    disabled={!courseData.title || !courseData.description || courseData.modules.length === 0}
                >
                    Create Course
                </Button>
            </Box>

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

export default CourseCreator;
