import { Response, NextFunction } from 'express';
import Course from '../models/Course.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ROLES, normalizeRole } from '../constants/roles.js';
import { AuthenticatedRequest } from '../types/express.types.js';

/**
 * Course Ownership Guard Middleware
 * Verifies that the authenticated user is either the course's instructor or an admin
 */
export const checkCourseOwnership = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.auth?.userId || req.user?._id;
    const userRole = normalizeRole(req.user?.role || req.auth?.role);

    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized: Please authenticate first', null, 401);
    }

    // Admins bypass ownership checks
    if (userRole === ROLES.ADMIN) {
      return next();
    }

    const courseId = req.params.courseId || req.params.id;
    if (!courseId) {
      return ApiResponse.error(res, 'Course ID is required', null, 400);
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return ApiResponse.error(res, 'Course not found', null, 404);
    }

    if (course.educator !== userId && course.instructorId !== userId) {
      return ApiResponse.error(
        res,
        'Forbidden: You do not have permission to modify this course',
        null,
        403
      );
    }

    // Attach course to request to avoid redundant query in controller/service
    (req as any).targetCourse = course;
    next();
  } catch (error: any) {
    return ApiResponse.error(res, error.message || 'Course ownership verification failed', null, 500);
  }
};

export default checkCourseOwnership;
