import { Request, Response, NextFunction, RequestHandler } from 'express';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ROLES, normalizeRole } from '../constants/roles.js';

/**
 * Require Course Access / Enrollment Middleware
 * Verifies that the user is enrolled in the course, is the instructor, or has admin privileges
 */
export const requireCourseAccess: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const studentId = req.auth?.userId || req.user?._id?.toString();
    const userRole = normalizeRole(req.user?.role || req.auth?.role);

    if (!studentId) {
      ApiResponse.error(res, 'Unauthorized: Please authenticate first', null, 401);
      return;
    }

    // Admins have full access
    if (userRole === ROLES.ADMIN) {
      return next();
    }

    const courseId = req.params.courseId || req.body.courseId;
    if (!courseId) {
      ApiResponse.error(res, 'Course ID is required', null, 400);
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      ApiResponse.error(res, 'Course not found', null, 404);
      return;
    }

    // Instructor of the course has full access
    if (course.educator === studentId || (course as any).instructorId === studentId) {
      return next();
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId,
      status: { $ne: 'cancelled' },
    });

    if (!enrollment) {
      ApiResponse.error(
        res,
        'Forbidden: You must be enrolled in this course to access this content',
        null,
        403
      );
      return;
    }

    req.enrollment = enrollment;
    next();
  } catch (error: any) {
    ApiResponse.error(res, error?.message || 'Course access verification failed', null, 500);
  }
};

export default requireCourseAccess;
