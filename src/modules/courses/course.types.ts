import { Document, Types } from 'mongoose';
import { ILesson } from '../lessons/lesson.types.js';

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'archived';

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

export interface IModule {
  moduleId: string;
  moduleTitle: string;
  moduleOrder: number;
  description?: string;
  lessons: ILesson[];
}

export interface IRoadmapItem {
  title: string;
  description?: string;
  order: number;
}

export interface ICourseRating {
  userId: string;
  rating: number;
}

export interface ICourse {
  _id?: Types.ObjectId | string;
  courseTitle: string;
  title?: string;
  slug: string;
  courseDescription: string;
  description?: string;
  courseThumbnail?: string;
  thumbnail?: string;
  category?: string;
  level?: CourseLevel;
  language?: string;
  coursePrice: number;
  price?: number;
  discount?: number;
  discountPrice?: number;
  duration?: string;
  status: CourseStatus;
  approvalStatus?: ApprovalStatus;
  rejectionReason?: string;
  isPublished?: boolean;
  
  educator: string;
  instructorId?: string;

  learningObjectives?: string[];
  prerequisites?: string[];
  skills?: string[];

  roadmap?: IRoadmapItem[];
  modules: IModule[];
  courseContent?: IChapter[];

  courseRatings?: ICourseRating[];
  enrolledStudents?: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICourseDocument extends Document, Omit<ICourse, '_id'> {
  _id: Types.ObjectId;
}
