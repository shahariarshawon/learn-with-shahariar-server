import mongoose, { Schema, Document, Model } from 'mongoose';

export type SubscriptionPlan = 'FREE' | 'PRO' | 'PREMIUM';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired';

export interface ISubscription {
  userId: mongoose.Types.ObjectId | string;
  plan: SubscriptionPlan;
  price: number;
  startDate: Date;
  endDate: Date;
  status: SubscriptionStatus;
  stripeSubscriptionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ISubscriptionDocument extends ISubscription, Document {}

const subscriptionSchema = new Schema<ISubscriptionDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    plan: {
      type: String,
      enum: ['FREE', 'PRO', 'PREMIUM'],
      default: 'FREE',
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    startDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'expired'],
      default: 'active',
      index: true,
    },
    stripeSubscriptionId: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.index({ userId: 1, status: 1 });

export const Subscription: Model<ISubscriptionDocument> =
  (mongoose.models.Subscription as Model<ISubscriptionDocument>) ||
  mongoose.model<ISubscriptionDocument>('Subscription', subscriptionSchema);

export default Subscription;
