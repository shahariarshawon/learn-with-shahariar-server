import { Response } from 'express';
import LearningService from '../services/learning.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../types/express.types.js';

export const completeLesson = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = (req.auth?.userId || req.user?._id) as string;
  const { courseId, lessonId, watchTime } = req.body;

  const result = await LearningService.completeLesson({
    studentId,
    courseId,
    lessonId,
    watchTime,
  });

  return ApiResponse.success(res, 'Lesson marked as completed', result);
});

export const updateWatchPosition = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = (req.auth?.userId || req.user?._id) as string;
  const { courseId, lessonId, watchTime, lastPosition } = req.body;

  const result = await LearningService.updateWatchPosition({
    studentId,
    courseId,
    lessonId,
    watchTime,
    lastPosition,
  });

  return ApiResponse.success(res, result.message, result);
});

export const getCourseProgress = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = (req.auth?.userId || req.user?._id) as string;
  const courseId = req.params.courseId as string;

  const result = await LearningService.getCourseProgress({ studentId, courseId });
  return ApiResponse.success(res, 'Course progress retrieved', result);
});

export const progressController = {
  completeLesson,
  updateWatchPosition,
  getCourseProgress,
};

export default progressController;
