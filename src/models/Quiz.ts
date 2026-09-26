import mongoose, { Schema, Model } from 'mongoose';
import { IQuizDocument } from '../types/quiz.types.js';

const questionSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (arr: string[]) {
          return arr.length === 4 && arr.every((opt) => opt && opt.trim() !== '');
        },
        message: 'Each question must have 4 non-empty options',
      },
    },
    answer: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
  },
  { _id: true }
);

const quizSchema = new Schema<IQuizDocument>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    chapterId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    questions: [questionSchema],
  },
  { timestamps: true }
);

quizSchema.index({ courseId: 1, chapterId: 1 }, { unique: true });

export const Quiz: Model<IQuizDocument> =
  (mongoose.models.Quiz as Model<IQuizDocument>) ||
  mongoose.model<IQuizDocument>('Quiz', quizSchema);

export default Quiz;
