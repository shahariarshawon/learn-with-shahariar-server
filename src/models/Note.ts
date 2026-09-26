import mongoose, { Schema, Model } from 'mongoose';
import { INoteDocument } from '../types/learning.types.js';

const noteSchema = new Schema<INoteDocument>(
  {
    studentId: { type: String, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: String, required: true, index: true },
    content: { type: String, required: true, trim: true },
    videoTimestamp: { type: Number, default: 0 },
  },
  { timestamps: true }
);

noteSchema.index({ studentId: 1, lessonId: 1 });
noteSchema.index({ studentId: 1, courseId: 1 });

export const Note: Model<INoteDocument> =
  (mongoose.models.Note as Model<INoteDocument>) ||
  mongoose.model<INoteDocument>('Note', noteSchema);

export default Note;
