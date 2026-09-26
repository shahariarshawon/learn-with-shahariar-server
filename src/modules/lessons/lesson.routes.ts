import { Router } from 'express';
import {
  getLessonsByCourse,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
} from './lesson.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateLesson } from './lesson.validation.js';

const router = Router();

router.get('/course/:courseId', getLessonsByCourse);
router.get('/:lessonId', getLessonById);
router.post('/', requireAuth, validateLesson, createLesson);
router.put('/:lessonId', requireAuth, validateLesson, updateLesson);
router.delete('/:lessonId', requireAuth, deleteLesson);

export default router;
