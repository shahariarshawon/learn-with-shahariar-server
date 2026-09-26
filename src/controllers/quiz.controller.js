import QuizService from '../services/quiz.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getQuiz = asyncHandler(async (req, res) => {
  const { courseId, chapterId } = req.params;
  const userId = req.auth.userId;

  const quiz = await QuizService.getQuiz({ courseId, chapterId, userId });
  return ApiResponse.success(res, 'Quiz retrieved successfully', { quiz });
});

export const createQuiz = asyncHandler(async (req, res) => {
  const educatorId = req.auth.userId;
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

export default {
  getQuiz,
  createQuiz,
};
