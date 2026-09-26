import UserService from '../services/user.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getUserData = asyncHandler(async (req, res) => {
  const userId = req.auth?.userId;
  const user = await UserService.getUserData(userId);
  return ApiResponse.success(res, 'User data retrieved', { user });
});

export const userEnrolledCourses = asyncHandler(async (req, res) => {
  const userId = req.auth?.userId;
  const enrolledCourses = await UserService.getUserEnrolledCourses(userId);
  return ApiResponse.success(res, 'Enrolled courses retrieved', { enrolledCourses });
});

export const purchaseCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.body;
  const { origin } = req.headers;
  const userId = req.auth.userId;

  const result = await UserService.purchaseCourse({ courseId, origin, userId });
  return ApiResponse.success(res, 'Checkout session created', { session_url: result.session_url });
});

export const updateUserCourseProgress = asyncHandler(async (req, res) => {
  const userId = req.auth.userId;
  const { courseId, lectureId } = req.body;

  const result = await UserService.updateCourseProgress({ userId, courseId, lectureId });
  return ApiResponse.success(res, result.message);
});

export const getUserCourseProgress = asyncHandler(async (req, res) => {
  const userId = req.auth.userId;
  const { courseId } = req.body;

  const progressData = await UserService.getUserCourseProgress({ userId, courseId });
  return ApiResponse.success(res, 'Progress data retrieved', { progressData });
});

export const addUserRating = asyncHandler(async (req, res) => {
  const userId = req.auth.userId;
  const { courseId, rating } = req.body;

  const result = await UserService.addRating({ userId, courseId, rating });
  return ApiResponse.success(res, result.message);
});

export const updateUserAfterPayment = asyncHandler(async (req, res) => {
  const { purchaseId } = req.body;
  const result = await UserService.updateUserAfterPayment({ purchaseId });
  return ApiResponse.success(res, result.message);
});

export default {
  getUserData,
  userEnrolledCourses,
  purchaseCourse,
  updateUserCourseProgress,
  getUserCourseProgress,
  addUserRating,
  updateUserAfterPayment,
};
