import express, { Router } from 'express';
import progressController from '../controllers/progress.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireCourseAccess } from '../middleware/access.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { completeLessonSchema, watchPositionSchema } from '../validators/learning.validator.js';

const progressRouter: Router = express.Router();

progressRouter.post(
  '/complete-lesson',
  authenticateUser,
  requireCourseAccess,
  validateRequest(completeLessonSchema),
  progressController.completeLesson
);

progressRouter.post(
  '/watch-position',
  authenticateUser,
  requireCourseAccess,
  validateRequest(watchPositionSchema),
  progressController.updateWatchPosition
);

progressRouter.get(
  '/course/:courseId',
  authenticateUser,
  requireCourseAccess,
  progressController.getCourseProgress
);

export default progressRouter;
