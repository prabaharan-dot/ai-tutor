import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    FormControl,
    FormControlLabel,
    LinearProgress,
    Radio,
    RadioGroup,
    Typography,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@mui/material';
import { Timer as TimerIcon } from '@mui/icons-material';
import { fetchQuiz, submitQuiz } from '../../services/api.service';

interface Option {
    id: string;
    text: string;
}

interface Question {
    id: string;
    text: string;
    options: Option[];
    timeLimit?: number;
}

interface Quiz {
    id: string;
    title: string;
    description: string;
    questions: Question[];
    timeLimit: number; // in minutes
}

interface Answer {
    questionId: string;
    selectedOptionId: string;
}

const QuizComponent: React.FC = () => {
    const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
    const navigate = useNavigate();
    
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [timeRemaining, setTimeRemaining] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showTimeWarning, setShowTimeWarning] = useState(false);
    const [confirmSubmit, setConfirmSubmit] = useState(false);

    // Load quiz data
    useEffect(() => {
        const loadQuiz = async () => {
            try {
                const quizData = await fetchQuiz(courseId!, moduleId!);
                setQuiz(quizData);
                setTimeRemaining(quizData.timeLimit * 60); // Convert minutes to seconds
            } catch (err: any) {
                setError(err.message || 'Failed to load quiz');
            } finally {
                setLoading(false);
            }
        };

        loadQuiz();
    }, [courseId, moduleId]);

    // Timer functionality
    useEffect(() => {
        if (!quiz || timeRemaining <= 0) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 300 && prev > 290) { // Show warning at 5 minutes remaining
                    setShowTimeWarning(true);
                }
                if (prev <= 1) {
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [quiz, timeRemaining]);

    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    const handleAnswerChange = (questionId: string, optionId: string) => {
        setAnswers(prev => {
            const existing = prev.find(a => a.questionId === questionId);
            if (existing) {
                return prev.map(a => 
                    a.questionId === questionId 
                        ? { ...a, selectedOptionId: optionId }
                        : a
                );
            }
            return [...prev, { questionId, selectedOptionId: optionId }];
        });
    };

    const handleTimeUp = useCallback(async () => {
        await handleSubmit();
    }, []);

    const handleSubmit = async () => {
        if (isSubmitting) return;

        try {
            setIsSubmitting(true);
            const submissionData = answers.map(answer => ({
                questionId: answer.questionId,
                answer: parseInt(answer.selectedOptionId)
            }));
            const result = await submitQuiz(courseId!, moduleId!, submissionData);
            navigate(`/courses/${courseId}/modules/${moduleId}/quiz/results`, {
                state: { result }
            });
        } catch (err: any) {
            setError(err.message || 'Failed to submit quiz');
            setIsSubmitting(false);
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < (quiz?.questions.length || 0) - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    if (loading) {
        return (
            <Container maxWidth="md">
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container maxWidth="md">
                <Typography color="error" align="center" my={4}>
                    {error}
                </Typography>
                <Button 
                    variant="contained" 
                    onClick={() => navigate(`/courses/${courseId}`)}
                >
                    Return to Course
                </Button>
            </Container>
        );
    }

    if (!quiz) {
        return null;
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const currentAnswer = answers.find(a => a.questionId === currentQuestion.id);
    const progress = (currentQuestionIndex + 1) / quiz.questions.length * 100;

    return (
        <Container maxWidth="md">
            <Box my={4}>
                <Card>
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h5">{quiz.title}</Typography>
                            <Box display="flex" alignItems="center">
                                <TimerIcon sx={{ mr: 1 }} />
                                <Typography
                                    color={timeRemaining <= 300 ? 'error' : 'inherit'}
                                >
                                    {formatTime(timeRemaining)}
                                </Typography>
                            </Box>
                        </Box>

                        <LinearProgress 
                            variant="determinate" 
                            value={progress} 
                            sx={{ mb: 3 }}
                        />

                        <Typography variant="h6" gutterBottom>
                            Question {currentQuestionIndex + 1} of {quiz.questions.length}
                        </Typography>

                        <Typography variant="body1" paragraph>
                            {currentQuestion.text}
                        </Typography>

                        <FormControl component="fieldset">
                            <RadioGroup
                                value={currentAnswer?.selectedOptionId || ''}
                                onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            >
                                {currentQuestion.options.map((option) => (
                                    <FormControlLabel
                                        key={option.id}
                                        value={option.id}
                                        control={<Radio />}
                                        label={option.text}
                                    />
                                ))}
                            </RadioGroup>
                        </FormControl>

                        <Box display="flex" justifyContent="space-between" mt={3}>
                            <Button
                                onClick={handlePrevious}
                                disabled={currentQuestionIndex === 0 || isSubmitting}
                            >
                                Previous
                            </Button>
                            {currentQuestionIndex === quiz.questions.length - 1 ? (
                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => setConfirmSubmit(true)}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <CircularProgress size={24} /> : 'Submit'}
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleNext}
                                    disabled={!currentAnswer || isSubmitting}
                                    variant="contained"
                                >
                                    Next
                                </Button>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Box>

            {/* Time Warning Dialog */}
            <Dialog
                open={showTimeWarning}
                onClose={() => setShowTimeWarning(false)}
            >
                <DialogTitle>Time Warning</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        You have 5 minutes remaining to complete the quiz.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowTimeWarning(false)} autoFocus>
                        Continue
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Confirm Submit Dialog */}
            <Dialog
                open={confirmSubmit}
                onClose={() => setConfirmSubmit(false)}
            >
                <DialogTitle>Confirm Submission</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to submit your quiz? 
                        {answers.length < quiz.questions.length && (
                            <Typography color="error" sx={{ mt: 1 }}>
                                Warning: You have not answered all questions.
                            </Typography>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmSubmit(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        Submit
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default QuizComponent;