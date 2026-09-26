import { Request, Response, NextFunction, RequestHandler } from 'express';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import Enrollment from '../models/Enrollment.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { EnrollmentError } from '../utils/errors.js';
import { ROLES, normalizeRole } from '../constants/roles.js';

export const verifyVideoAccess: RequestHandler = async (
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

    const lessonId = req.params.lessonId || req.body.lessonId;
    if (!lessonId) {
      ApiResponse.error(res, 'Lesson ID is required', null, 400);
      return;
    }

    // Step 1: Find lesson metadata & parent courseId
    let courseId: string | null = null;
    let targetLesson: any = null;

    // First try standalone Lesson collection
    if (lessonId.match(/^[0-9a-fA-F]{24}$/)) {
      targetLesson = await Lesson.findById(lessonId);
      if (targetLesson) {
        courseId = targetLesson.courseId.toString();
      }
    }

    // If not found in standalone collection, search inside Course embedded modules
    if (!courseId) {
      const courseContainingLesson = await Course.findOne({
        $or: [
          { 'modules.lessons.lessonId': lessonId },
          { 'modules.lessons._id': lessonId },
          { 'courseContent.chapterContent.lectureId': lessonId },
        ],
      });

      if (courseContainingLesson) {
        courseId = courseContainingLesson._id.toString();
        // Extract lesson info
        for (const mod of courseContainingLesson.modules || []) {
          for (const les of mod.lessons || []) {
            const lesId = (les as any).lessonId || (les as any)._id?.toString() || (les as any).lectureId;
            if (lesId === lessonId) {
              targetLesson = les;
              break;
            }
          }
          if (targetLesson) break;
        }
      }
    }

    if (!courseId) {
      ApiResponse.error(res, 'Lesson or associated course not found', null, 404);
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      ApiResponse.error(res, 'Associated course not found', null, 404);
      return;
    }

    // Prepare permission flags
    const isAdmin = userRole === ROLES.ADMIN;
    const isOwner =
      course.educator?.toString() === studentId.toString() ||
      (course as any).instructorId?.toString() === studentId.toString();

    // Admins and Course Owners automatically get access
    if (isAdmin || isOwner) {
      req.videoAccess = {
        courseId,
        lessonId,
        lesson: targetLesson,
        course,
        permissions: { canWatch: true, isOwner, isAdmin },
      };
      return next();
    }

    // Allow free preview lessons if marked isPreview
    if (targetLesson?.isPreview || targetLesson?.isPreviewFree) {
      req.videoAccess = {
        courseId,
        lessonId,
        lesson: targetLesson,
        course,
        permissions: { canWatch: true, isOwner: false, isAdmin: false },
      };
      return next();
    }

    // Step 2: Check Student Enrollment
    const enrollment = await Enrollment.findOne({
      studentId,
      courseId,
      status: { $ne: 'cancelled' },
    });

    if (!enrollment) {
      // Exact 403 response message requested: "You are not enrolled in this course."
      ApiResponse.error(res, 'You are not enrolled in this course.', null, 403);
      return;
    }

    req.enrollment = enrollment;
    req.videoAccess = {
      courseId,
      lessonId,
      lesson: targetLesson,
      course,
      permissions: { canWatch: true, isOwner: false, isAdmin: false },
    };

    next();
  } catch (error: any) {
    if (error instanceof EnrollmentError) {
      ApiResponse.error(res, error.message, null, error.statusCode);
      return;
    }
    ApiResponse.error(res, error?.message || 'Video access verification failed', null, 500);
  }
};

export default verifyVideoAccess;
