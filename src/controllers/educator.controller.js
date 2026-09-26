import EducatorService from '../services/educator.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const updateRoleToEducator = asyncHandler(async (req, res) => {
  const userId = req.auth.userId;
  const result = await EducatorService.updateRoleToEducator(userId);
  return ApiResponse.success(res, result.message);
});

export const addCourse = asyncHandler(async (req, res) => {
  const { courseData } = req.body;
  const imageFile = req.file;
  const educatorId = req.auth.userId;

  const newCourse = await EducatorService.addCourse({
    educatorId,
    courseDataRaw: courseData,
    imageFile,
  });

  return ApiResponse.success(res, 'Course Added', { course: newCourse }, 201);
});

export const getEducatorCourses = asyncHandler(async (req, res) => {
  const educatorId = req.auth.userId;
  const courses = await EducatorService.getEducatorCourses(educatorId);
  return ApiResponse.success(res, 'Educator courses retrieved', { courses });
});

export const educatorDashboardData = asyncHandler(async (req, res) => {
  const educatorId = req.auth.userId;
  const dashboardData = await EducatorService.getDashboardData(educatorId);
  return ApiResponse.success(res, 'Dashboard data retrieved', { dashboardData });
});

export const getEnrolledStudentsData = asyncHandler(async (req, res) => {
  const educatorId = req.auth.userId;
  const enrolledStudents = await EducatorService.getEnrolledStudentsData(educatorId);
  return ApiResponse.success(res, 'Enrolled students retrieved', { enrolledStudents });
});

export default {
  updateRoleToEducator,
  addCourse,
  getEducatorCourses,
  educatorDashboardData,
  getEnrolledStudentsData,
};
