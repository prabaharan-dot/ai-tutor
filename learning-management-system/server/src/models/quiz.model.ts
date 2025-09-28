import mongoose, { Document, Schema } from 'mongoose';
import { IUser } from './user.model';

// Interfaces
export interface IChoice {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface IQuestion {
    id: string;
    text: string;
    choices: IChoice[];
    explanation?: string;
    points: number;
}

export interface IQuizAttempt {
    user: IUser['_id'];
    score: number;
    answers: {
        questionId: string;
        selectedChoice: string;
        isCorrect: boolean;
    }[];
    startTime: Date;
    endTime: Date;
    completed: boolean;
}

export interface IQuiz extends Document {
    title: string;
    description: string;
    questions: IQuestion[];
    timeLimit: number; // in minutes
    passingScore: number;
    attempts: IQuizAttempt[];
    courseId: Schema.Types.ObjectId;
    shuffleQuestions: boolean;
    shuffleChoices: boolean;
    createdAt: Date;
    updatedAt: Date;
    getAverageScore(): number;
    hasUserAttempted(userId: string): boolean;
    getUserBestScore(userId: string): number;
}

// Schemas
const ChoiceSchema = new Schema<IChoice>({
    id: { type: String, required: true },
    text: { type: String, required: true },
    isCorrect: { type: Boolean, required: true }
});

const QuestionSchema = new Schema<IQuestion>({
    id: { type: String, required: true },
    text: { type: String, required: true },
    choices: [ChoiceSchema],
    explanation: { type: String },
    points: { type: Number, required: true, default: 1 }
});

const QuizAttemptSchema = new Schema<IQuizAttempt>({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    score: { type: Number, required: true },
    answers: [{
        questionId: { type: String, required: true },
        selectedChoice: { type: String, required: true },
        isCorrect: { type: Boolean, required: true }
    }],
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    completed: { type: Boolean, required: true, default: false }
});

const QuizSchema = new Schema<IQuiz>({
    title: { type: String, required: true },
    description: { type: String, required: true },
    questions: [QuestionSchema],
    timeLimit: { type: Number, required: true }, // in minutes
    passingScore: { type: Number, required: true },
    attempts: [QuizAttemptSchema],
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    shuffleQuestions: { type: Boolean, default: false },
    shuffleChoices: { type: Boolean, default: false }
}, {
    timestamps: true
});

// Methods
QuizSchema.methods.getAverageScore = function(this: IQuiz): number {
    if (!this.attempts || this.attempts.length === 0) return 0;
    const totalScore = this.attempts.reduce((sum, attempt) => sum + attempt.score, 0);
    return Math.round((totalScore / this.attempts.length) * 10) / 10;
};

QuizSchema.methods.hasUserAttempted = function(this: IQuiz, userId: string): boolean {
    return this.attempts.some(attempt => attempt.user.toString() === userId);
};

QuizSchema.methods.getUserBestScore = function(this: IQuiz, userId: string): number {
    const userAttempts = this.attempts.filter(attempt => 
        attempt.user.toString() === userId && attempt.completed
    );
    if (userAttempts.length === 0) return 0;
    return Math.max(...userAttempts.map(attempt => attempt.score));
};

// Indexes
QuizSchema.index({ courseId: 1 });
QuizSchema.index({ 'attempts.user': 1 });

export const Quiz = mongoose.model<IQuiz>('Quiz', QuizSchema);