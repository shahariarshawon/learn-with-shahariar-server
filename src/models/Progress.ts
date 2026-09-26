import mongoose, { Schema, Model } from 'mongoose';
import { IProgressDocument } from '../types/learning.types.js';

const progressSchema = new Schema<IProgressDocument>(
  {
    studentId: { type: String, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: String, required: true, index: true },
    completed: { type: Boolean, default: false, index: true },
    completedAt: { type: Date },
    watchTime: { type: Number, default: 0, min: 0 },
    lastPosition: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

// Unique index per student and lesson
progressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });
progressSchema.index({ studentId: 1, courseId: 1, completed: 1 });

export const Progress: Model<IProgressDocument> =
  (mongoose.models.Progress as Model<IProgressDocument>) ||
  mongoose.model<IProgressDocument>('Progress', progressSchema);

export default Progress;
