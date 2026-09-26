import mongoose, { Schema, Model } from 'mongoose';
import { ILessonDocument } from '../types/lesson.types.js';

const resourceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const lessonSchema = new Schema<ILessonDocument>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    videoUrl: { type: String, required: true, trim: true },
    duration: { type: Number, default: 0, min: 0 },
    resources: [resourceSchema],
    moduleId: { type: String, required: true, trim: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    order: { type: Number, required: true, default: 0 },
    isPreview: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Compound index for fast module lesson ordering
lessonSchema.index({ courseId: 1, moduleId: 1, order: 1 });

export const Lesson: Model<ILessonDocument> =
  (mongoose.models.Lesson as Model<ILessonDocument>) ||
  mongoose.model<ILessonDocument>('Lesson', lessonSchema);

export default Lesson;
