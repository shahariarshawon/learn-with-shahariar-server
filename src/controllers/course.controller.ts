import { Response } from 'express';
import CourseService from '../services/course.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../types/express.types.js';
import { ROLES, normalizeRole } from '../constants/roles.js';

/**
 * Create a new course (Instructor / Admin)
 */
export const createCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const instructorId = (req.auth?.userId || req.user?._id) as string;
  const imageFile = req.file;

  const course = await CourseService.createCourse({
    instructorId,
    courseDataRaw: req.body.courseData || req.body,
    imageFile,
  });

  return ApiResponse.success(res, 'Course created successfully', { course }, 201);
});

/**
 * Get public catalogue of published courses
 */
export const getPublicCourses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await CourseService.getPublicCourses(req.query as any);
  return ApiResponse.success(res, 'Courses retrieved successfully', result);
});

/**
 * Get courses created by authenticated instructor
 */
export const getMyCourses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const instructorId = (req.auth?.userId || req.user?._id) as string;
  const courses = await CourseService.getInstructorCourses(instructorId);
  return ApiResponse.success(res, 'Instructor courses retrieved successfully', { courses });
});

/**
 * Get course details by ID or Slug
 */
export const getCourseByIdOrSlug = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const idOrSlug = (req.params.idOrSlug || req.params.id) as string;
  const userRole = normalizeRole(req.user?.role || req.auth?.role);
  const isInstructorOrAdmin = userRole === ROLES.INSTRUCTOR || userRole === ROLES.ADMIN;

  const courseData = await CourseService.getCourseByIdOrSlug(idOrSlug, isInstructorOrAdmin);
  return ApiResponse.success(res, 'Course details retrieved', { courseData });
});

/**
 * Update course metadata & learning info
 */
export const updateCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = (req.params.courseId || req.params.id) as string;
  const course = await CourseService.updateCourse(courseId, req.body);
  return ApiResponse.success(res, 'Course updated successfully', { course });
});

/**
 * Delete course
 */
export const deleteCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = (req.params.courseId || req.params.id) as string;
  const result = await CourseService.deleteCourse(courseId);
  return ApiResponse.success(res, result.message);
});

/**
 * Publish course
 */
export const publishCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = (req.params.courseId || req.params.id) as string;
  const course = await CourseService.setCourseStatus(courseId, 'published');
  return ApiResponse.success(res, 'Course published successfully', { course });
});

/**
 * Unpublish course
 */
export const unpublishCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = (req.params.courseId || req.params.id) as string;
  const course = await CourseService.setCourseStatus(courseId, 'draft');
  return ApiResponse.success(res, 'Course unpublished (moved to draft)', { course });
});

// ==================== SYLLABUS: MODULE CONTROLLERS ====================

export const addModule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = req.params.courseId as string;
  const course = await CourseService.addModule(courseId, req.body);
  return ApiResponse.success(res, 'Module added successfully', { course }, 201);
});

export const updateModule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = req.params.courseId as string;
  const moduleId = req.params.moduleId as string;
  const course = await CourseService.updateModule(courseId, moduleId, req.body);
  return ApiResponse.success(res, 'Module updated successfully', { course });
});

export const deleteModule = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = req.params.courseId as string;
  const moduleId = req.params.moduleId as string;
  const course = await CourseService.deleteModule(courseId, moduleId);
  return ApiResponse.success(res, 'Module deleted successfully', { course });
});

export const reorderModules = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = req.params.courseId as string;
  const { modules } = req.body;
  const course = await CourseService.reorderModules(courseId, modules);
  return ApiResponse.success(res, 'Modules reordered successfully', { course });
});

// ==================== SYLLABUS: LESSON CONTROLLERS ====================

export const addLesson = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = req.params.courseId as string;
  const moduleId = req.params.moduleId as string;
  const course = await CourseService.addLesson(courseId, moduleId, req.body);
  return ApiResponse.success(res, 'Lesson added successfully', { course }, 201);
});

export const updateLesson = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = req.params.courseId as string;
  const lessonId = req.params.lessonId as string;
  const course = await CourseService.updateLesson(courseId, lessonId, req.body);
  return ApiResponse.success(res, 'Lesson updated successfully', { course });
});

export const deleteLesson = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = req.params.courseId as string;
  const lessonId = req.params.lessonId as string;
  const course = await CourseService.deleteLesson(courseId, lessonId);
  return ApiResponse.success(res, 'Lesson deleted successfully', { course });
});

export const reorderLessons = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = req.params.courseId as string;
  const moduleId = req.params.moduleId as string;
  const { lessons } = req.body;
  const course = await CourseService.reorderLessons(courseId, moduleId, lessons);
  return ApiResponse.success(res, 'Lessons reordered successfully', { course });
});

// ==================== ROADMAP CONTROLLERS ====================

export const updateRoadmap = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = req.params.courseId as string;
  const { roadmap } = req.body;
  const course = await CourseService.updateRoadmap(courseId, roadmap);
  return ApiResponse.success(res, 'Course roadmap updated successfully', { course });
});

// ==================== LEGACY COMPATIBILITY HANDLERS ====================

export const getAllCourse = getPublicCourses;
export const getCourseId = getCourseByIdOrSlug;
export const getEducatorCourses = getMyCourses;
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
  createCourse,
  getPublicCourses,
  getMyCourses,
  getCourseByIdOrSlug,
  updateCourse,
  deleteCourse,
  publishCourse,
  unpublishCourse,
  addModule,
  updateModule,
  deleteModule,
  reorderModules,
  addLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  updateRoadmap,
  // Legacy
  getAllCourse,
  getCourseId,
  getEducatorCourses,
  addChapter,
  addLecture,
};

export default courseController;
