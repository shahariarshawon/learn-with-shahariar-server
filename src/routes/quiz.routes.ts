import express, { Router } from 'express';
import quizController from '../controllers/quiz.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const quizRouter: Router = express.Router();

quizRouter.post('/create', authenticateUser, quizController.createQuiz);
quizRouter.get('/:courseId/:chapterId', authenticateUser, quizController.getQuiz);

export default quizRouter;
