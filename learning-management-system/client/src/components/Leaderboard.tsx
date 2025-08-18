import React, { useEffect, useState } from 'react';
import {
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    CircularProgress,
} from '@mui/material';
import { fetchLeaderboard } from '../services/api.service';

interface LeaderboardEntry {
    userId: string;
    name: string;
    totalScore: number;
    coursesCompleted: number;
    rank: number;
}

const Leaderboard: React.FC = () => {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadLeaderboard = async () => {
            try {
                const data = await fetchLeaderboard();
                setLeaderboardData(data);
            } catch (err) {
                setError('Failed to load leaderboard data');
            } finally {
                setLoading(false);
            }
        };

        loadLeaderboard();
    }, []);

    if (loading) {
        return (
            <Container sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Typography color="error" align="center">
                    {error}
                </Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Leaderboard
                </Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Rank</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell align="right">Courses Completed</TableCell>
                                <TableCell align="right">Total Score</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leaderboardData.map((entry) => (
                                <TableRow
                                    key={entry.userId}
                                    sx={{
                                        backgroundColor:
                                            entry.rank <= 3 ? 'rgba(255, 215, 0, 0.1)' : 'inherit',
                                    }}
                                >
                                    <TableCell>{entry.rank}</TableCell>
                                    <TableCell>{entry.name}</TableCell>
                                    <TableCell align="right">
                                        {entry.coursesCompleted}
                                    </TableCell>
                                    <TableCell align="right">{entry.totalScore}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default Leaderboard;
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