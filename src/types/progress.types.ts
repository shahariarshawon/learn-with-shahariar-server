import { Document } from 'mongoose';

export interface ICourseProgress {
  userId: string;
  courseId: string;
  completed?: boolean;
  lectureCompleted: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICourseProgressDocument extends Document, ICourseProgress {}
