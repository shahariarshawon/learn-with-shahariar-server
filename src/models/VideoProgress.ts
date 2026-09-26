import mongoose, { Schema, Model } from 'mongoose';
import { IVideoProgressDocument } from '../types/video.types.js';

const videoProgressSchema = new Schema<IVideoProgressDocument>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    lessonId: {
      type: String,
      required: true,
      index: true,
    },
    watchTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastPosition: {
      type: Number,
      default: 0,
      min: 0,
    },
    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: One video progress record per student & lesson
videoProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });

// Compound Index for rapid course progress lookup per student
videoProgressSchema.index({ studentId: 1, courseId: 1 });

export const VideoProgress: Model<IVideoProgressDocument> =
  (mongoose.models.VideoProgress as Model<IVideoProgressDocument>) ||
  mongoose.model<IVideoProgressDocument>('VideoProgress', videoProgressSchema);

export default VideoProgress;
