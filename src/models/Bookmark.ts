import mongoose, { Schema, Model } from 'mongoose';
import { IBookmarkDocument } from '../types/learning.types.js';

const bookmarkSchema = new Schema<IBookmarkDocument>(
  {
    studentId: { type: String, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

bookmarkSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });
bookmarkSchema.index({ studentId: 1, courseId: 1 });

export const Bookmark: Model<IBookmarkDocument> =
  (mongoose.models.Bookmark as Model<IBookmarkDocument>) ||
  mongoose.model<IBookmarkDocument>('Bookmark', bookmarkSchema);

export default Bookmark;
