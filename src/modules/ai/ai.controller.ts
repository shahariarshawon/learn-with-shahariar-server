import { Response } from 'express';
import { AuthenticatedRequest } from '../../types/express.types.js';
import AIService from './ai.service.js';
import { ApiResponse } from '../../utils/apiResponse.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export class AIController {
  /**
   * POST /api/ai/chat
   * Context-aware AI Chat Assistant
   */
  static chat = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = (req.auth?.userId || req.user?._id)?.toString();
    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized access', null, 401);
    }

    const { question, courseId, lessonId } = req.body;
    const chatResult = await AIService.chat(userId, { question, courseId, lessonId });

    return ApiResponse.success(res, 'AI response generated successfully', chatResult);
  });

  /**
   * POST /api/ai/index-course/:courseId
   * Indexes course content into RAG embedding knowledge base
   */
  static indexCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const courseId = String(req.params.courseId);
    const result = await AIService.indexCourseContent(courseId);

    return ApiResponse.success(res, 'Course content indexed for AI RAG search successfully', result);
  });

  /**
   * POST /api/ai/generate-quiz
   * Generates AI multiple-choice quiz questions
   */
  static generateQuiz = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { lessonId, difficulty, questionCount } = req.body;

    const quiz = await AIService.generateQuiz({
      lessonId,
      difficulty,
      questionCount: questionCount ? Number(questionCount) : 5,
    });

    return ApiResponse.success(res, 'AI quiz generated successfully', quiz);
  });

  /**
   * POST /api/ai/generate-summary
   * Generates lesson summary, key points & learning objectives
   */
  static generateSummary = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { lessonId, courseId } = req.body;

    const summary = await AIService.generateSummary({ lessonId, courseId });

    return ApiResponse.success(res, 'AI summary generated successfully', summary);
  });

  /**
   * GET /api/ai/recommendations
   * Personalized AI course recommendations
   */
  static getRecommendations = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = (req.auth?.userId || req.user?._id)?.toString();
    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized access', null, 401);
    }

    const recommendations = await AIService.getPersonalizedRecommendations(userId);

    return ApiResponse.success(res, 'Personalized AI recommendations retrieved successfully', recommendations);
  });
}

export default AIController;
