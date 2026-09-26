import mongoose, { Schema, Model } from 'mongoose';
import { ICourseProgressDocument } from '../types/progress.types.js';

const courseProgressSchema = new Schema<ICourseProgressDocument>(
  {
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    completed: { type: Boolean, default: false },
    lectureCompleted: [{ type: String }],
  },
  { minimize: false, timestamps: true }
);

export const CourseProgress: Model<ICourseProgressDocument> =
  (mongoose.models.CourseProgress as Model<ICourseProgressDocument>) ||
  mongoose.model<ICourseProgressDocument>('CourseProgress', courseProgressSchema);

export default CourseProgress;
