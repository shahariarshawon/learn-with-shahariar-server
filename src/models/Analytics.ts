import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAnalytics {
  courseId: mongoose.Types.ObjectId | string;
  viewsCount: number;
  uniqueVisitors: number;
  enrollmentsCount: number;
  revenueGenerated: number;
  date: string; // YYYY-MM-DD format
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAnalyticsDocument extends IAnalytics, Document {}

const analyticsSchema = new Schema<IAnalyticsDocument>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    uniqueVisitors: {
      type: Number,
      default: 0,
      min: 0,
    },
    enrollmentsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    revenueGenerated: {
      type: Number,
      default: 0,
      min: 0,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: One analytics record per course per day
analyticsSchema.index({ courseId: 1, date: 1 }, { unique: true });

export const Analytics: Model<IAnalyticsDocument> =
  (mongoose.models.Analytics as Model<IAnalyticsDocument>) ||
  mongoose.model<IAnalyticsDocument>('Analytics', analyticsSchema);

export default Analytics;
