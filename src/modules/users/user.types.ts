import { Document, Types } from 'mongoose';

export type UserRole = 'student' | 'instructor' | 'admin' | 'educator';

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  imageUrl?: string;
  profileImage?: string;
  bio?: string;
  skills?: string[];
  enrolledCourses?: (Types.ObjectId | string)[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IUserDocument extends Document, Omit<IUser, '_id'> {
  _id: string;
  avatar?: string;
  comparePassword(enteredPassword: string): Promise<boolean>;
}
