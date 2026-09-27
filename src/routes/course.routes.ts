import express, { Router } from 'express';
import courseController from '../controllers/course.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/rbac.middleware.js';
import { checkCourseOwnership } from '../middleware/ownership.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import upload from '../middleware/upload.middleware.js';
import { ROLES } from '../constants/roles.js';
import {
  createCourseSchema,
  updateCourseSchema,
  createModuleSchema,
  updateModuleSchema,
  reorderModulesSchema,
  createLessonSchema,
  updateLessonSchema,
  reorderLessonsSchema,
  updateRoadmapSchema,
} from '../validators/course.validator.js';

const courseRouter: Router = express.Router();

// ==================== PUBLIC CATALOGUE ====================
courseRouter.get('/', courseController.getPublicCourses);
courseRouter.get('/all', courseController.getAllCourse);

// ==================== INSTRUCTOR COURSES ====================
courseRouter.get(
  '/my-courses',
  authenticateUser,
  authorizeRole(ROLES.INSTRUCTOR, ROLES.ADMIN),
  courseController.getMyCourses
);
courseRouter.get(
  '/educator-courses',
  authenticateUser,
  authorizeRole(ROLES.INSTRUCTOR, ROLES.ADMIN),
  courseController.getEducatorCourses
);

// ==================== COURSE MANAGEMENT ====================
courseRouter.post(
  '/',
  upload.single('thumbnail'),
  authenticateUser,
  authorizeRole(ROLES.INSTRUCTOR, ROLES.ADMIN),
  courseController.createCourse
);

courseRouter.get('/:idOrSlug', courseController.getCourseByIdOrSlug);

courseRouter.patch(
  '/:id',
  authenticateUser,
  checkCourseOwnership,
  validateRequest(updateCourseSchema),
  courseController.updateCourse
);

courseRouter.delete(
  '/:id',
  authenticateUser,
  checkCourseOwnership,
  courseController.deleteCourse
);

courseRouter.post(
  '/:id/publish',
  authenticateUser,
  checkCourseOwnership,
  courseController.publishCourse
);

courseRouter.post(
  '/:id/unpublish',
  authenticateUser,
  checkCourseOwnership,
  courseController.unpublishCourse
);

// ==================== ROADMAP MANAGEMENT ====================
courseRouter.post(
  '/:courseId/roadmap',
  authenticateUser,
  checkCourseOwnership,
  validateRequest(updateRoadmapSchema),
  courseController.updateRoadmap
);

// ==================== SYLLABUS: MODULE MANAGEMENT ====================
courseRouter.post(
  '/:courseId/modules',
  authenticateUser,
  checkCourseOwnership,
  validateRequest(createModuleSchema),
  courseController.addModule
);

courseRouter.patch(
  '/:courseId/modules/:moduleId',
  authenticateUser,
  checkCourseOwnership,
  validateRequest(updateModuleSchema),
  courseController.updateModule
);

courseRouter.delete(
  '/:courseId/modules/:moduleId',
  authenticateUser,
  checkCourseOwnership,
  courseController.deleteModule
);

courseRouter.post(
  '/:courseId/modules/reorder',
  authenticateUser,
  checkCourseOwnership,
  validateRequest(reorderModulesSchema),
  courseController.reorderModules
);

// ==================== SYLLABUS: LESSON MANAGEMENT ====================
courseRouter.post(
  '/:courseId/modules/:moduleId/lessons',
  authenticateUser,
  checkCourseOwnership,
  validateRequest(createLessonSchema),
  courseController.addLesson
);

courseRouter.patch(
  '/:courseId/lessons/:lessonId',
  authenticateUser,
  checkCourseOwnership,
  validateRequest(updateLessonSchema),
  courseController.updateLesson
);

courseRouter.delete(
  '/:courseId/lessons/:lessonId',
  authenticateUser,
  checkCourseOwnership,
  courseController.deleteLesson
);

courseRouter.post(
  '/:courseId/modules/:moduleId/lessons/reorder',
  authenticateUser,
  checkCourseOwnership,
  validateRequest(reorderLessonsSchema),
  courseController.reorderLessons
);

// ==================== LEGACY COMPATIBILITY & DIRECT CRUD ENDPOINTS ====================
courseRouter.post('/create', upload.single('image'), authenticateUser, courseController.createCourse);
courseRouter.post('/add-lecture', authenticateUser, courseController.addLecture);
courseRouter.post('/add-chapter', authenticateUser, courseController.addChapter);
courseRouter.put('/update/:courseId', authenticateUser, courseController.updateCourse);
courseRouter.delete('/delete/:courseId', authenticateUser, courseController.deleteCourse);
courseRouter.patch('/status/:courseId', authenticateUser, courseController.publishCourse);
courseRouter.post('/:courseId/submit-review', authenticateUser, courseController.submitForReview);
courseRouter.get('/:id', courseController.getCourseId);

export default courseRouter;
