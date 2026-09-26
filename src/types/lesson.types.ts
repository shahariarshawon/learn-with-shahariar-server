import { Document, Types } from 'mongoose';

export interface ILessonResource {
  title: string;
  url: string;
}

export interface ILesson {
  _id?: Types.ObjectId | string;
  title: string;
  description?: string;
  videoUrl: string;
  duration: number; // in seconds or minutes
  resources?: ILessonResource[];
  moduleId: string;
  courseId: Types.ObjectId | string;
  order: number;
  isPreview?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ILessonDocument extends Document, Omit<ILesson, '_id'> {
  _id: Types.ObjectId;
}
