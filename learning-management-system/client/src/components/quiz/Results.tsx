import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Typography,
    List,
    ListItem,
    ListItemText,
    Divider,
    CircularProgress,
} from '@mui/material';
import { CheckCircle, Cancel, ArrowBack } from '@mui/icons-material';
import { green, red } from '@mui/material/colors';

interface QuizResult {
    score: number;
    totalQuestions: number;
    timeTaken: number;
    answers: {
        questionId: string;
        question: string;
        correctAnswer: string;
        userAnswer: string;
        isCorrect: boolean;
    }[];
    feedback: string;
}

const Results: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { courseId } = useParams<{ courseId: string }>();
    const result = location.state?.result as QuizResult;

    if (!result) {
        return (
            <Container maxWidth="md">
                <Box display="flex" justifyContent="center" my={4}>
                    <Typography variant="h6" color="error">
                        No results available. Please take the quiz first.
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    onClick={() => navigate(`/courses/${courseId}`)}
                    startIcon={<ArrowBack />}
                >
                    Return to Course
                </Button>
            </Container>
        );
    }

    const percentage = (result.score / result.totalQuestions) * 100;
    const formatTime = (seconds: number): string => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    return (
        <Container maxWidth="md">
            <Box my={4}>
                <Card>
                    <CardContent>
                        <Typography variant="h4" align="center" gutterBottom>
                            Quiz Results
                        </Typography>

                        <Box display="flex" justifyContent="center" my={4}>
                            <Box position="relative" display="inline-flex">
                                <CircularProgress
                                    variant="determinate"
                                    value={percentage}
                                    size={120}
                                    color={percentage >= 70 ? "success" : "error"}
                                />
                                <Box
                                    position="absolute"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    top={0}
                                    left={0}
                                    right={0}
                                    bottom={0}
                                >
                                    <Typography variant="h5" component="div">
                                        {Math.round(percentage)}%
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Box textAlign="center" mb={4}>
                            <Typography variant="h6" gutterBottom>
                                Score: {result.score} / {result.totalQuestions}
                            </Typography>
                            <Typography variant="body1" color="textSecondary">
                                Time taken: {formatTime(result.timeTaken)}
                            </Typography>
                            <Typography variant="body1" mt={2} color={
                                percentage >= 70 ? green[600] : red[600]
                            }>
                                {result.feedback}
                            </Typography>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom>
                            Detailed Results
                        </Typography>

                        <List>
                            {result.answers.map((answer, index) => (
                                <React.Fragment key={answer.questionId}>
                                    <ListItem>
                                        <Box width="100%">
                                            <Box display="flex" alignItems="center" mb={1}>
                                                <Typography variant="subtitle1" component="div">
                                                    Question {index + 1}
                                                </Typography>
                                                {answer.isCorrect ? (
                                                    <CheckCircle sx={{ color: green[500], ml: 1 }} />
                                                ) : (
                                                    <Cancel sx={{ color: red[500], ml: 1 }} />
                                                )}
                                            </Box>
                                            <ListItemText
                                                primary={answer.question}
                                                secondary={
                                                    <>
                                                        <Typography component="span" display="block" color="textSecondary">
                                                            Your answer: {answer.userAnswer}
                                                        </Typography>
                                                        {!answer.isCorrect && (
                                                            <Typography component="span" display="block" color="error">
                                                                Correct answer: {answer.correctAnswer}
                                                            </Typography>
                                                        )}
                                                    </>
                                                }
                                            />
                                        </Box>
                                    </ListItem>
                                    {index < result.answers.length - 1 && <Divider />}
                                </React.Fragment>
                            ))}
                        </List>

                        <Box display="flex" justifyContent="space-between" mt={4}>
                            <Button
                                variant="outlined"
                                onClick={() => navigate(`/courses/${courseId}`)}
                                startIcon={<ArrowBack />}
                            >
                                Return to Course
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate(`/courses/${courseId}/leaderboard`)}
                            >
                                View Leaderboard
                            </Button>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
};

export default Results;