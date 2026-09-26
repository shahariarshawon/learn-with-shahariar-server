import express, { Router } from 'express';
import bookmarkController from '../controllers/bookmark.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireCourseAccess } from '../middleware/access.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createBookmarkSchema } from '../validators/learning.validator.js';

const bookmarkRouter: Router = express.Router();

bookmarkRouter.post(
  '/',
  authenticateUser,
  requireCourseAccess,
  validateRequest(createBookmarkSchema),
  bookmarkController.addBookmark
);

bookmarkRouter.delete('/:lessonId', authenticateUser, bookmarkController.removeBookmark);
bookmarkRouter.get('/', authenticateUser, bookmarkController.getStudentBookmarks);

export default bookmarkRouter;
