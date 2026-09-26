import { Response, NextFunction } from 'express';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ROLES, normalizeRole } from '../constants/roles.js';
import { AuthenticatedRequest } from '../types/express.types.js';

/**
 * Require Course Access / Enrollment Middleware
 * Verifies that the user is enrolled in the course, is the instructor, or has admin privileges
 */
export const requireCourseAccess = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const studentId = req.auth?.userId || req.user?._id;
    const userRole = normalizeRole(req.user?.role || req.auth?.role);

    if (!studentId) {
      return ApiResponse.error(res, 'Unauthorized: Please authenticate first', null, 401);
    }

    // Admins have full access
    if (userRole === ROLES.ADMIN) {
      return next();
    }

    const courseId = req.params.courseId || req.body.courseId;
    if (!courseId) {
      return ApiResponse.error(res, 'Course ID is required', null, 400);
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return ApiResponse.error(res, 'Course not found', null, 404);
    }

    // Instructor of the course has full access
    if (course.educator === studentId || course.instructorId === studentId) {
      return next();
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId,
      status: { $ne: 'cancelled' },
    });

    if (!enrollment) {
      return ApiResponse.error(
        res,
        'Forbidden: You must be enrolled in this course to access this content',
        null,
        403
      );
    }

    (req as any).enrollment = enrollment;
    next();
  } catch (error: any) {
    return ApiResponse.error(res, error.message || 'Course access verification failed', null, 500);
  }
};

export default requireCourseAccess;
