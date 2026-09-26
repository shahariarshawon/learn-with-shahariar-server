import express, { Router } from 'express';
import noteController from '../controllers/note.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { requireCourseAccess } from '../middleware/access.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { createNoteSchema, updateNoteSchema } from '../validators/learning.validator.js';

const noteRouter: Router = express.Router();

noteRouter.post(
  '/',
  authenticateUser,
  requireCourseAccess,
  validateRequest(createNoteSchema),
  noteController.createNote
);

noteRouter.patch(
  '/:id',
  authenticateUser,
  validateRequest(updateNoteSchema),
  noteController.updateNote
);

noteRouter.delete('/:id', authenticateUser, noteController.deleteNote);
noteRouter.get('/lesson/:lessonId', authenticateUser, noteController.getLessonNotes);
noteRouter.get('/course/:courseId', authenticateUser, requireCourseAccess, noteController.getCourseNotes);

export default noteRouter;
