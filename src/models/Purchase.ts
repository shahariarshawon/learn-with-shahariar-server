import mongoose, { Schema, Model } from 'mongoose';
import { IPurchaseDocument } from '../types/purchase.types.js';

const purchaseSchema = new Schema<IPurchaseDocument>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    userId: {
      type: String,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'completed',
    },
  },
  { timestamps: true }
);

export const Purchase: Model<IPurchaseDocument> =
  (mongoose.models.Purchase as Model<IPurchaseDocument>) ||
  mongoose.model<IPurchaseDocument>('Purchase', purchaseSchema);

export default Purchase;
