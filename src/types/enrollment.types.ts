import { Document, Types } from 'mongoose';

export type EnrollmentStatus = 'active' | 'completed' | 'cancelled';

export interface IEnrollment {
  _id?: Types.ObjectId | string;
  studentId: string;
  courseId: Types.ObjectId | string;
  enrolledAt?: Date;
  progress: number; // percentage 0-100
  completedLessons: string[];
  status: EnrollmentStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEnrollmentDocument extends Document, Omit<IEnrollment, '_id'> {
  _id: Types.ObjectId;
}
