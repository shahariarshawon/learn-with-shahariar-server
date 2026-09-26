import { Document, Types } from 'mongoose';

export interface ILesson {
  _id?: Types.ObjectId | string;
  courseId: Types.ObjectId | string;
  chapterId: string;
  title: string;
  duration?: number;
  videoUrl?: string;
  content?: string;
  isPreviewFree?: boolean;
  order: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILessonDocument extends Document, Omit<ILesson, '_id'> {
  _id: Types.ObjectId;
}

export interface IEnrollment {
  _id?: Types.ObjectId | string;
  userId: string;
  courseId: Types.ObjectId | string;
  enrolledAt?: Date;
  status: 'active' | 'completed' | 'cancelled';
  progressPercentage: number;
  completedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IEnrollmentDocument extends Document, Omit<IEnrollment, '_id'> {
  _id: Types.ObjectId;
}

export interface ICertificate {
  _id?: Types.ObjectId | string;
  userId: string;
  courseId: Types.ObjectId | string;
  certificateNumber: string;
  issueDate?: Date;
  pdfUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICertificateDocument extends Document, Omit<ICertificate, '_id'> {
  _id: Types.ObjectId;
}

export interface IReview {
  _id?: Types.ObjectId | string;
  courseId: Types.ObjectId | string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IReviewDocument extends Document, Omit<IReview, '_id'> {
  _id: Types.ObjectId;
}

export interface IAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface IAIConversation {
  _id?: Types.ObjectId | string;
  userId: string;
  courseId?: Types.ObjectId | string;
  title: string;
  messages: IAIMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAIConversationDocument extends Document, Omit<IAIConversation, '_id'> {
  _id: Types.ObjectId;
}
