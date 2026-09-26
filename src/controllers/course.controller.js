import CourseService from '../services/course.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getAllCourse = asyncHandler(async (req, res) => {
  const result = await CourseService.getAllCourses();
  return ApiResponse.success(res, 'Courses fetched successfully', result);
});

export const getCourseId = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const courseData = await CourseService.getCourseById(id);
  return ApiResponse.success(res, 'Course retrieved successfully', { courseData });
});

export const updateCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const course = await CourseService.updateCourse(courseId, req.body);
  return ApiResponse.success(res, 'Course updated successfully', { course });
});

export const getEducatorCourses = asyncHandler(async (req, res) => {
  const educatorId = req.auth.userId;
  const courses = await CourseService.getEducatorCourses(educatorId);
  return ApiResponse.success(res, 'Educator courses retrieved', { courses });
});

export const addChapter = asyncHandler(async (req, res) => {
  const { courseId, chapter } = req.body;
  const course = await CourseService.addChapter(courseId, chapter);
  return ApiResponse.success(res, 'Chapter added successfully', { course });
});

export const addLecture = asyncHandler(async (req, res) => {
  const { courseId, chapterId, lecture } = req.body;
  const course = await CourseService.addLecture(courseId, chapterId, lecture);
  return ApiResponse.success(res, 'Lecture added successfully', { course });
});

export default {
  getAllCourse,
  getCourseId,
  updateCourse,
  getEducatorCourses,
  addChapter,
  addLecture,
};
