import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    googleId?: string;
    role: string;
    enrolledCourses: mongoose.Types.ObjectId[];
    progress: {
        courseId: mongoose.Types.ObjectId;
        completedModules: string[];
        quizScores: { moduleId: string; score: number }[];
    }[];
    totalScore: number;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    googleId: {
        type: String,
    },
    enrolledCourses: [{
        type: Schema.Types.ObjectId,
        ref: 'Course'
    }],
    progress: [{
        courseId: {
            type: Schema.Types.ObjectId,
            ref: 'Course'
        },
        completedModules: [String],
        quizScores: [{
            moduleId: String,
            score: Number
        }]
    }],
    totalScore: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
});

export default mongoose.model<IUser>('User', UserSchema);