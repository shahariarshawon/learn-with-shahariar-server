import { Document, Types } from 'mongoose';

export interface IProgress {
  _id?: Types.ObjectId | string;
  studentId: string;
  courseId: Types.ObjectId | string;
  lessonId: string;
  completed: boolean;
  completedAt?: Date;
  watchTime: number; // seconds
  lastPosition: number; // seconds
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProgressDocument extends Document, Omit<IProgress, '_id'> {
  _id: Types.ObjectId;
}

export interface IBookmark {
  _id?: Types.ObjectId | string;
  studentId: string;
  courseId: Types.ObjectId | string;
  lessonId: string;
  createdAt?: Date;
}

export interface IBookmarkDocument extends Document, Omit<IBookmark, '_id'> {
  _id: Types.ObjectId;
}

export interface INote {
  _id?: Types.ObjectId | string;
  studentId: string;
  courseId: Types.ObjectId | string;
  lessonId: string;
  content: string;
  videoTimestamp?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface INoteDocument extends Document, Omit<INote, '_id'> {
  _id: Types.ObjectId;
}

export interface IWatchHistory {
  _id?: Types.ObjectId | string;
  studentId: string;
  courseId: Types.ObjectId | string;
  lessonId: string;
  watchTime: number;
  lastPosition: number;
  updatedAt?: Date;
}

export interface IWatchHistoryDocument extends Document, Omit<IWatchHistory, '_id'> {
  _id: Types.ObjectId;
}
