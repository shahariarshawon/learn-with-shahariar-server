import express from 'express';
import quizController from '../controllers/quiz.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const quizRouter = express.Router();

quizRouter.post('/create', authenticateUser, quizController.createQuiz);
quizRouter.get('/:courseId/:chapterId', authenticateUser, quizController.getQuiz);

export default quizRouter;
