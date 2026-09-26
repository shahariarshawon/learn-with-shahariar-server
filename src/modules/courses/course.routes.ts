import { Router } from 'express';
import {
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
  addChapter,
  addLecture,
} from './course.controller.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware.js';
import { uploadSingle } from '../../middleware/upload.middleware.js';
import { validateCreateCourse, validateUpdateCourse } from './course.validation.js';

const router = Router();

// Public catalogue routes
router.get('/', getPublicCourses);
router.get('/all', getPublicCourses);
router.get('/id/:idOrSlug', optionalAuth, getCourseByIdOrSlug);
router.get('/:idOrSlug', optionalAuth, getCourseByIdOrSlug);

// Instructor authenticated routes
router.post('/create', requireAuth, uploadSingle('image'), validateCreateCourse, createCourse);
router.post('/add', requireAuth, uploadSingle('image'), validateCreateCourse, createCourse);
router.get('/instructor/my-courses', requireAuth, getMyCourses);

// Course Management
router.put('/:courseId', requireAuth, validateUpdateCourse, updateCourse);
router.delete('/:courseId', requireAuth, deleteCourse);
router.patch('/:courseId/publish', requireAuth, publishCourse);
router.patch('/:courseId/unpublish', requireAuth, unpublishCourse);

// Syllabus & Module Routes
router.post('/:courseId/modules', requireAuth, addModule);
router.put('/:courseId/modules/:moduleId', requireAuth, updateModule);
router.delete('/:courseId/modules/:moduleId', requireAuth, deleteModule);
router.put('/:courseId/modules-reorder', requireAuth, reorderModules);

// Lesson Routes
router.post('/:courseId/modules/:moduleId/lessons', requireAuth, addLesson);
router.put('/:courseId/lessons/:lessonId', requireAuth, updateLesson);
router.delete('/:courseId/lessons/:lessonId', requireAuth, deleteLesson);
router.put('/:courseId/modules/:moduleId/lessons-reorder', requireAuth, reorderLessons);

// Roadmap Routes
router.put('/:courseId/roadmap', requireAuth, updateRoadmap);

// Legacy backward-compatibility endpoints
router.post('/add-chapter', requireAuth, addChapter);
router.post('/add-lecture', requireAuth, addLecture);

export default router;
