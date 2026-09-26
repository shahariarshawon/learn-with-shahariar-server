import { Document, Types } from 'mongoose';

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';

export interface ILecture {
  lectureId: string;
  lectureTitle: string;
  lectureDuration: number;
  lectureUrl: string;
  isPreviewFree?: boolean;
  lectureOrder: number;
}

export interface IChapter {
  chapterId: string;
  chapterOrder: number;
  chapterTitle: string;
  chapterContent: ILecture[];
}

export interface ICourseRating {
  userId: string;
  rating: number;
}

export interface ICourse {
  _id?: Types.ObjectId | string;
  courseTitle: string;
  courseDescription: string;
  courseThumbnail?: string;
  coursePrice: number;
  discount?: number;
  isPublished?: boolean;
  category?: string;
  level?: CourseLevel;
  duration?: string;
  requirements?: string[];
  learningObjectives?: string[];
  courseContent: IChapter[];
  educator: string;
  courseRatings?: ICourseRating[];
  enrolledStudents?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICourseDocument extends Document, Omit<ICourse, '_id'> {
  _id: Types.ObjectId;
  title?: string;
  description?: string;
  thumbnail?: string;
  price?: number;
  instructor?: string;
  sections?: IChapter[];
}
