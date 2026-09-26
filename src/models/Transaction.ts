import mongoose, { Schema, Document, Model } from 'mongoose';

export type TransactionStatus = 'pending' | 'success' | 'completed' | 'failed' | 'refunded';

export interface ITransaction {
  transactionId: string;
  studentId: mongoose.Types.ObjectId | string;
  instructorId: mongoose.Types.ObjectId | string;
  courseId: mongoose.Types.ObjectId | string;
  amount: number;
  currency?: string;
  status: TransactionStatus;
  paymentMethod?: string;
  refundReason?: string;
  refundedAt?: Date;
  stripeSessionId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ITransactionDocument extends ITransaction, Document {}

const transactionSchema = new Schema<ITransactionDocument>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'success', 'completed', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    paymentMethod: {
      type: String,
      default: 'stripe',
      trim: true,
    },
    refundReason: {
      type: String,
      default: '',
    },
    refundedAt: {
      type: Date,
    },
    stripeSessionId: {
      type: String,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

transactionSchema.index({ status: 1, createdAt: -1 });
transactionSchema.index({ studentId: 1, createdAt: -1 });
transactionSchema.index({ courseId: 1, createdAt: -1 });

export const Transaction: Model<ITransactionDocument> =
  (mongoose.models.Transaction as Model<ITransactionDocument>) ||
  mongoose.model<ITransactionDocument>('Transaction', transactionSchema);

export default Transaction;
