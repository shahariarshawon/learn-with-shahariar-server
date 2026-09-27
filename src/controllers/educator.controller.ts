import { Response } from 'express';
import EducatorService from '../services/educator.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../types/express.types.js';
import { normalizeRole, ROLES } from '../constants/roles.js';

export const updateRoleToEducator = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.auth?.userId || req.user?._id;
  const result = await EducatorService.updateRoleToEducator(userId as string);
  return ApiResponse.success(res, result.message);
});

export const addCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseData } = req.body;
  const imageFile = req.file;
  const educatorId = (req.auth?.userId || req.user?._id) as string;

  const newCourse = await EducatorService.addCourse({
    educatorId,
    courseDataRaw: courseData,
    imageFile,
  });

  return ApiResponse.success(res, 'Course Added', { course: newCourse }, 201);
});

export const getEducatorCourses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const educatorId = (req.auth?.userId || req.user?._id) as string;
  const userRole = normalizeRole(req.user?.role || req.auth?.role);
  const isAdmin = userRole === ROLES.ADMIN;
  const courses = await EducatorService.getEducatorCourses(educatorId, isAdmin);
  return ApiResponse.success(res, 'Educator courses retrieved', { courses });
});

export const educatorDashboardData = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const educatorId = (req.auth?.userId || req.user?._id) as string;
  const dashboardData = await EducatorService.getDashboardData(educatorId);
  return ApiResponse.success(res, 'Dashboard data retrieved', { dashboardData });
});

export const getEnrolledStudentsData = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const educatorId = (req.auth?.userId || req.user?._id) as string;
  const enrolledStudents = await EducatorService.getEnrolledStudentsData(educatorId);
  return ApiResponse.success(res, 'Enrolled students retrieved', { enrolledStudents });
});

export const educatorController = {
  updateRoleToEducator,
  addCourse,
  getEducatorCourses,
  educatorDashboardData,
  getEnrolledStudentsData,
};

export default educatorController;
