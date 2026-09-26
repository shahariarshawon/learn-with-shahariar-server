import { Document, Types } from 'mongoose';

export interface IVideoProgress {
  studentId: Types.ObjectId | string;
  courseId: Types.ObjectId | string;
  lessonId: string;
  watchTime: number;
  lastPosition: number;
  completed: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IVideoProgressDocument extends IVideoProgress, Document {}

export interface IVideoPermissions {
  canWatch: boolean;
  isOwner: boolean;
  isAdmin: boolean;
}

export interface IVideoAccessResponse {
  lessonId: string;
  videoUrl: string;
  studentEmail: string;
  permissions: IVideoPermissions;
  lesson?: {
    title: string;
    duration: number;
    courseId: string;
    moduleId?: string;
  };
}

export interface IWatchProgressPayload {
  lessonId: string;
  watchTime: number;
  lastPosition: number;
  completed?: boolean;
}

export interface IContinueWatchingResponse {
  lessonId: string;
  lessonTitle: string;
  lastPosition: number;
  watchTime: number;
  course: {
    courseId: string;
    title: string;
    slug: string;
    thumbnail: string;
  };
}
