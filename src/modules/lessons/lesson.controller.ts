import { Request, Response } from 'express';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import LessonService from './lesson.service.js';

export const getLessonsByCourse = asyncHandler(async (req: Request, res: Response) => {
  const courseId = req.params.courseId as string;
  const lessons = await LessonService.getLessonsByCourse(courseId);
  return ApiResponse.success(res, 'Lessons retrieved successfully', { lessons });
});

export const getLessonById = asyncHandler(async (req: Request, res: Response) => {
  const lessonId = req.params.lessonId as string;
  const lesson = await LessonService.getLessonById(lessonId);
  return ApiResponse.success(res, 'Lesson details retrieved', { lesson });
});

export const createLesson = asyncHandler(async (req: Request, res: Response) => {
  const lesson = await LessonService.createLesson(req.body);
  return ApiResponse.success(res, 'Lesson created successfully', { lesson }, 201);
});

export const updateLesson = asyncHandler(async (req: Request, res: Response) => {
  const lessonId = req.params.lessonId as string;
  const lesson = await LessonService.updateLesson(lessonId, req.body);
  return ApiResponse.success(res, 'Lesson updated successfully', { lesson });
});

export const deleteLesson = asyncHandler(async (req: Request, res: Response) => {
  const lessonId = req.params.lessonId as string;
  const result = await LessonService.deleteLesson(lessonId);
  return ApiResponse.success(res, result.message);
});

export const lessonController = {
  getLessonsByCourse,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
};

export default lessonController;
