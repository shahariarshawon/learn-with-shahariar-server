import { Document, Types } from 'mongoose';

export interface IQuizQuestion {
  question: string;
  options: string[];
  answer: number;
}

export interface IQuiz {
  _id?: Types.ObjectId | string;
  courseId: Types.ObjectId | string;
  chapterId: string;
  title: string;
  questions: IQuizQuestion[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IQuizDocument extends Document, Omit<IQuiz, '_id'> {
  _id: Types.ObjectId;
}
