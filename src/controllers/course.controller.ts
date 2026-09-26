import { Response } from 'express';
import CourseService from '../services/course.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../types/express.types.js';

export const getAllCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await CourseService.getAllCourses();
  return ApiResponse.success(res, 'Courses fetched successfully', result);
});

export const getCourseId = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const id = req.params.id as string;
  const courseData = await CourseService.getCourseById(id);
  return ApiResponse.success(res, 'Course retrieved successfully', { courseData });
});

export const updateCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = req.params.courseId as string;
  const course = await CourseService.updateCourse(courseId, req.body);
  return ApiResponse.success(res, 'Course updated successfully', { course });
});

export const getEducatorCourses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const educatorId = req.auth?.userId || req.user?._id;
  const courses = await CourseService.getEducatorCourses(educatorId as string);
  return ApiResponse.success(res, 'Educator courses retrieved', { courses });
});

export const addChapter = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId, chapter } = req.body;
  const course = await CourseService.addChapter(courseId, chapter);
  return ApiResponse.success(res, 'Chapter added successfully', { course });
});

export const addLecture = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { courseId, chapterId, lecture } = req.body;
  const course = await CourseService.addLecture(courseId, chapterId, lecture);
  return ApiResponse.success(res, 'Lecture added successfully', { course });
});

export const courseController = {
  getAllCourse,
  getCourseId,
  updateCourse,
  getEducatorCourses,
  addChapter,
  addLecture,
};

export default courseController;
