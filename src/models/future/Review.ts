import mongoose, { Schema, Model } from 'mongoose';
import { IReviewDocument } from '../../types/future.types.js';

const reviewSchema = new Schema<IReviewDocument>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    userId: { type: String, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

export const Review: Model<IReviewDocument> =
  (mongoose.models.Review as Model<IReviewDocument>) ||
  mongoose.model<IReviewDocument>('Review', reviewSchema);

export default Review;
