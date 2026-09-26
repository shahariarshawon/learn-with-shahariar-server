import mongoose, { Schema, Model } from 'mongoose';
import { IWatchHistoryDocument } from '../types/learning.types.js';

const watchHistorySchema = new Schema<IWatchHistoryDocument>(
  {
    studentId: { type: String, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: String, required: true, index: true },
    watchTime: { type: Number, default: 0, min: 0 },
    lastPosition: { type: Number, default: 0, min: 0 },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

watchHistorySchema.index({ studentId: 1, lessonId: 1 }, { unique: true });
watchHistorySchema.index({ studentId: 1, updatedAt: -1 });

export const WatchHistory: Model<IWatchHistoryDocument> =
  (mongoose.models.WatchHistory as Model<IWatchHistoryDocument>) ||
  mongoose.model<IWatchHistoryDocument>('WatchHistory', watchHistorySchema);

export default WatchHistory;
