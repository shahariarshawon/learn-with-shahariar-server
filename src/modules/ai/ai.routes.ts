import { Router } from 'express';
import AIController from './ai.controller.js';
import { authenticateUser } from '../../middleware/auth.middleware.js';
import { aiLimiter } from '../../middleware/rateLimiter.middleware.js';
import { authorizeRole } from '../../middleware/rbac.middleware.js';

const aiRouter: Router = Router();

// Apply AI rate limiter to all AI routes
aiRouter.use(aiLimiter);

/**
 * GET /api/ai/recommendations
 * Personalized course recommendations
 */
aiRouter.get('/recommendations', authenticateUser, AIController.getRecommendations);

/**
 * POST /api/ai/chat
 * Context-aware AI Chat assistant
 */
aiRouter.post('/chat', authenticateUser, AIController.chat);

/**
 * POST /api/ai/generate-quiz
 * Generate multiple-choice questions for a lesson
 */
aiRouter.post('/generate-quiz', authenticateUser, AIController.generateQuiz);

/**
 * POST /api/ai/generate-summary
 * Generate lesson summary & learning objectives
 */
aiRouter.post('/generate-summary', authenticateUser, AIController.generateSummary);

/**
 * POST /api/ai/index-course/:courseId
 * Index course content into RAG embedding store (Instructor/Admin)
 */
aiRouter.post(
  '/index-course/:courseId',
  authenticateUser,
  authorizeRole('instructor', 'admin'),
  AIController.indexCourse
);

export default aiRouter;
