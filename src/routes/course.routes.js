import express from 'express';
import courseController from '../controllers/course.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { addChapterSchema, addLectureSchema } from '../validators/course.validator.js';

const courseRouter = express.Router();

courseRouter.get('/all', courseController.getAllCourse);
courseRouter.get('/educator-courses', authenticateUser, courseController.getEducatorCourses);

courseRouter.post(
  '/add-lecture',
  authenticateUser,
  validateRequest(addLectureSchema),
  courseController.addLecture
);

courseRouter.post(
  '/add-chapter',
  authenticateUser,
  validateRequest(addChapterSchema),
  courseController.addChapter
);

courseRouter.put('/update/:courseId', authenticateUser, courseController.updateCourse);

courseRouter.get('/:id', courseController.getCourseId);

export default courseRouter;
