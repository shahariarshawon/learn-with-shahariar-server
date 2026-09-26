import { Response } from 'express';
import QuizService from '../services/quiz.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../types/express.types.js';

export const getQuiz = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const courseId = req.params.courseId as string;
  const chapterId = req.params.chapterId as string;
  const userId = (req.auth?.userId || req.user?._id) as string;

  const quiz = await QuizService.getQuiz({ courseId, chapterId, userId });
  return ApiResponse.success(res, 'Quiz retrieved successfully', { quiz });
});

export const createQuiz = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const educatorId = (req.auth?.userId || req.user?._id) as string;
  const { courseId, chapterId, title, questions } = req.body;

  const quiz = await QuizService.createQuiz({
    educatorId,
    courseId,
    chapterId,
    title,
    questions,
  });

  return ApiResponse.success(res, 'Quiz created successfully', { quiz }, 201);
});

export const quizController = {
  getQuiz,
  createQuiz,
};

export default quizController;
