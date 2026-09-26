import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRevenue {
  instructorId: mongoose.Types.ObjectId | string;
  courseId: mongoose.Types.ObjectId | string;
  studentId: mongoose.Types.ObjectId | string;
  enrollmentId?: mongoose.Types.ObjectId | string;
  purchaseId?: string;
  totalAmount: number;
  instructorEarning: number;
  platformCommission: number;
  currency?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRevenueDocument extends IRevenue, Document {}

const revenueSchema = new Schema<IRevenueDocument>(
  {
    instructorId: {
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
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Enrollment',
    },
    purchaseId: {
      type: String,
      trim: true,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    instructorEarning: {
      type: Number,
      required: true,
      min: 0,
    },
    platformCommission: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

revenueSchema.index({ instructorId: 1, createdAt: -1 });
revenueSchema.index({ courseId: 1, createdAt: -1 });

export const Revenue: Model<IRevenueDocument> =
  (mongoose.models.Revenue as Model<IRevenueDocument>) ||
  mongoose.model<IRevenueDocument>('Revenue', revenueSchema);

export default Revenue;
