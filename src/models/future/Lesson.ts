import mongoose, { Schema, Model } from 'mongoose';
import { ILessonDocument } from '../../types/future.types.js';

const lessonSchema = new Schema<ILessonDocument>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    chapterId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    duration: { type: Number, default: 0 },
    videoUrl: { type: String, default: '' },
    content: { type: String, default: '' },
    isPreviewFree: { type: Boolean, default: false },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Lesson: Model<ILessonDocument> =
  (mongoose.models.Lesson as Model<ILessonDocument>) ||
  mongoose.model<ILessonDocument>('Lesson', lessonSchema);

export default Lesson;
