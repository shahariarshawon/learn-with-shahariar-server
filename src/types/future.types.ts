import { Document, Types } from 'mongoose';
import { ILesson } from './lesson.types.js';
import { IEnrollment } from './enrollment.types.js';

export { ILesson, ILessonDocument } from './lesson.types.js';
export { IEnrollment, IEnrollmentDocument } from './enrollment.types.js';

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
