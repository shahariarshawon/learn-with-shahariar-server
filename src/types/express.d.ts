import { IUserDocument } from './user.types.js';
import { IEnrollmentDocument } from './enrollment.types.js';
import { ICourseDocument } from './course.types.js';

export interface IVideoAccessContext {
  courseId: string;
  lessonId: string;
  lesson?: any;
  course?: ICourseDocument | any;
  permissions: {
    canWatch: boolean;
    isOwner: boolean;
    isAdmin: boolean;
  };
}

declare global {
  namespace Express {
    interface Request {
      user?: IUserDocument;
      auth?: {
        userId: string;
        role?: string;
      };
      enrollment?: IEnrollmentDocument;
      videoAccess?: IVideoAccessContext;
    }
  }
}
