import { Request, Response, NextFunction, RequestHandler } from 'express';
import Course from '../models/Course.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ROLES, normalizeRole } from '../constants/roles.js';

/**
 * Course Ownership Guard Middleware
 * Verifies that the authenticated user is either the course's instructor or an admin
 */
export const checkCourseOwnership: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.auth?.userId || req.user?._id?.toString();
    const userRole = normalizeRole(req.user?.role || req.auth?.role);

    if (!userId) {
      ApiResponse.error(res, 'Unauthorized: Please authenticate first', null, 401);
      return;
    }

    // Admins bypass ownership checks
    if (userRole === ROLES.ADMIN) {
      return next();
    }

    const courseId = req.params.courseId || req.params.id;
    if (!courseId) {
      ApiResponse.error(res, 'Course ID is required', null, 400);
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      ApiResponse.error(res, 'Course not found', null, 404);
      return;
    }

    if (course.educator !== userId && (course as any).instructorId !== userId) {
      ApiResponse.error(
        res,
        'Forbidden: You do not have permission to modify this course',
        null,
        403
      );
      return;
    }

    next();
  } catch (error: any) {
    ApiResponse.error(res, error?.message || 'Course ownership verification failed', null, 500);
  }
};

export default checkCourseOwnership;
