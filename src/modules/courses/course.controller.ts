import { Response } from 'express';
import CourseService from './course.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../../types/express.types.js';
import { ROLES, normalizeRole } from '../../constants/roles.js';

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

export const getPublicCourses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await CourseService.getPublicCourses(req.query as any);
  return ApiResponse.success(res, 'Courses retrieved successfully', result);
});

export const getMyCourses = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const instructorId = (req.auth?.userId || req.user?._id) as string;
  const userRole = normalizeRole(req.user?.role || req.auth?.role);
  const isAdmin = userRole === ROLES.ADMIN;
  const courses = await CourseService.getInstructorCourses(instructorId, isAdmin);
  return ApiResponse.success(res, 'Instructor courses retrieved successfully', { courses });
});

export const getCourseByIdOrSlug = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const idOrSlug = (req.params.idOrSlug || req.params.id) as string;
  const userRole = normalizeRole(req.user?.role || req.auth?.role);
  const isInstructorOrAdmin = userRole === ROLES.INSTRUCTOR || userRole === ROLES.ADMIN;

  const courseData = await CourseService.getCourseByIdOrSlug(idOrSlug, isInstructorOrAdmin);
  return ApiResponse.success(res, 'Course details retrieved', { courseData });
});

export const updateCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = (req.params.courseId || req.params.id) as string;
  const course = await CourseService.updateCourse(courseId, req.body);
  return ApiResponse.success(res, 'Course updated successfully', { course });
});

export const deleteCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = (req.params.courseId || req.params.id) as string;
  const result = await CourseService.deleteCourse(courseId);
  return ApiResponse.success(res, result.message);
});

export const publishCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = (req.params.courseId || req.params.id) as string;
  const course = await CourseService.setCourseStatus(courseId, 'published');
  return ApiResponse.success(res, 'Course published successfully', { course });
});

export const unpublishCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = (req.params.courseId || req.params.id) as string;
  const course = await CourseService.setCourseStatus(courseId, 'draft');
  return ApiResponse.success(res, 'Course unpublished (moved to draft)', { course });
});

export const submitForReview = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = (req.params.courseId || req.params.id) as string;
  const course = await CourseService.submitForReview(courseId);
  return ApiResponse.success(res, 'Course submitted for moderation review', { course });
});

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

export const updateRoadmap = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = req.params.courseId as string;
  const { roadmap } = req.body;
  const course = await CourseService.updateRoadmap(courseId, roadmap);
  return ApiResponse.success(res, 'Course roadmap updated successfully', { course });
});

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
  submitForReview,
  addModule,
  updateModule,
  deleteModule,
  reorderModules,
  addLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
  updateRoadmap,
  getAllCourse,
  getCourseId,
  getEducatorCourses,
  addChapter,
  addLecture,
};

export default courseController;
