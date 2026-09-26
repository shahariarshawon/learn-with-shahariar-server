import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express.types.js';
import InstructorService from '../services/instructor.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class InstructorController {
  /**
   * GET /api/instructor/dashboard
   */
  static getDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = (req.auth?.userId || req.user?._id)?.toString();
    if (!instructorId) {
      return ApiResponse.error(res, 'Unauthorized access', null, 401);
    }

    const data = await InstructorService.getInstructorDashboardData(instructorId);
    return ApiResponse.success(res, 'Instructor dashboard metrics retrieved successfully', data);
  });

  /**
   * GET /api/instructor/courses
   */
  static getCourses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = (req.auth?.userId || req.user?._id)?.toString();
    if (!instructorId) {
      return ApiResponse.error(res, 'Unauthorized access', null, 401);
    }

    const courses = await InstructorService.getInstructorCourses(instructorId);
    return ApiResponse.success(res, 'Instructor courses retrieved successfully', courses);
  });

  /**
   * PATCH /api/instructor/courses/:courseId/status
   */
  static updateCourseStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = (req.auth?.userId || req.user?._id)?.toString();
    if (!instructorId) {
      return ApiResponse.error(res, 'Unauthorized access', null, 401);
    }

    const courseId = String(req.params.courseId);
    const { status } = req.body;

    const course = await InstructorService.updateCourseStatus(instructorId, courseId, status);
    return ApiResponse.success(res, `Course status updated to ${status}`, course);
  });

  /**
   * GET /api/instructor/students
   */
  static getStudents = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = (req.auth?.userId || req.user?._id)?.toString();
    if (!instructorId) {
      return ApiResponse.error(res, 'Unauthorized access', null, 401);
    }

    const students = await InstructorService.getInstructorStudents(instructorId);
    return ApiResponse.success(res, 'Enrolled students retrieved successfully', students);
  });

  /**
   * GET /api/instructor/analytics/:courseId
   */
  static getCourseAnalytics = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = (req.auth?.userId || req.user?._id)?.toString();
    if (!instructorId) {
      return ApiResponse.error(res, 'Unauthorized access', null, 401);
    }

    const courseId = String(req.params.courseId);
    const analytics = await InstructorService.getCourseAnalytics(instructorId, courseId);
    return ApiResponse.success(res, 'Course analytics retrieved successfully', analytics);
  });

  /**
   * GET /api/instructor/revenue
   */
  static getRevenue = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const instructorId = (req.auth?.userId || req.user?._id)?.toString();
    if (!instructorId) {
      return ApiResponse.error(res, 'Unauthorized access', null, 401);
    }

    const data = await InstructorService.getInstructorRevenueData(instructorId);
    return ApiResponse.success(res, 'Instructor revenue analytics retrieved successfully', data);
  });
}

export default InstructorController;
