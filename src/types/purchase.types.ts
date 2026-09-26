import { Document, Types } from 'mongoose';

export type PurchaseStatus = 'pending' | 'completed' | 'failed';

export interface IPurchase {
  _id?: Types.ObjectId | string;
  courseId: Types.ObjectId | string;
  userId: string;
  amount: number;
  status: PurchaseStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPurchaseDocument extends Document, Omit<IPurchase, '_id'> {
  _id: Types.ObjectId;
}
