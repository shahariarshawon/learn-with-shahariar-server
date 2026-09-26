import { Response } from 'express';
import LearningService from '../services/learning.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../types/express.types.js';

export const continueLearning = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = (req.auth?.userId || req.user?._id) as string;
  const result = await LearningService.continueLearning(studentId);

  if (!result) {
    return ApiResponse.success(res, 'No active learning sessions found', { continueLearning: null });
  }

  return ApiResponse.success(res, 'Continue learning data retrieved', { continueLearning: result });
});

export const learningController = {
  continueLearning,
};

export default learningController;
