import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IQuizQuestion extends Document {
    text: string;
    options: Array<{
        text: string;
        isCorrect: boolean;
    }>;
    explanation?: string;
}

export interface IQuiz extends Document {
    title: string;
    description?: string;
    timeLimit: number;
    questions: IQuizQuestion[];
    passingScore: number;
}

export interface IModule extends Document {
    title: string;
    content: string;
    order: number;
    estimatedDuration: number;
    quiz?: IQuiz;
    resources?: Array<{
        title: string;
        type: 'video' | 'document' | 'link';
        url: string;
    }>;
}

export interface ICourse extends Document {
    title: string;
    description: string;
    level: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    thumbnail?: string;
    instructor: Types.ObjectId;
    modules: IModule[];
    enrolledStudents: Types.ObjectId[];
    price: number;
    isPublished: boolean;
    rating: number;
    reviews: Array<{
        user: Types.ObjectId;
        rating: number;
        comment: string;
        createdAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const QuizQuestionSchema = new Schema({
    text: { type: String, required: true },
    options: [{
        text: { type: String, required: true },
        isCorrect: { type: Boolean, required: true }
    }],
    explanation: { type: String }
});

const QuizSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    timeLimit: { type: Number, required: true, min: 1 },
    questions: [QuizQuestionSchema],
    passingScore: { type: Number, required: true, min: 0, max: 100, default: 70 }
});

const ModuleSchema = new Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    order: { type: Number, required: true },
    estimatedDuration: { type: Number, required: true },
    quiz: QuizSchema,
    resources: [{
        title: { type: String, required: true },
        type: { type: String, enum: ['video', 'document', 'link'], required: true },
        url: { type: String, required: true }
    }]
});

const CourseSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    level: { 
        type: String, 
        required: true,
        enum: ['beginner', 'intermediate', 'advanced']
    },
    tags: [{ type: String }],
    thumbnail: { type: String },
    instructor: { 
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    modules: [ModuleSchema],
    enrolledStudents: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    price: { 
        type: Number,
        required: true,
        min: 0
    },
    isPublished: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviews: [{
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: { type: String },
        createdAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
CourseSchema.index({ title: 'text', description: 'text', tags: 'text' });
CourseSchema.index({ instructor: 1 });
CourseSchema.index({ isPublished: 1 });
CourseSchema.index({ level: 1 });
CourseSchema.index({ rating: -1 });

// Calculate average rating before saving
CourseSchema.pre('save', function(this: ICourse & Document, next) {
    if (this.reviews?.length > 0) {
        const totalRating = this.reviews.reduce((sum: number, review) => sum + review.rating, 0);
        this.rating = Math.round((totalRating / this.reviews.length) * 10) / 10;
    }
    next();
});

const Course = mongoose.model<ICourse>('Course', CourseSchema);
export default Course;