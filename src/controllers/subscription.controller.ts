import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express.types.js';
import SubscriptionService from '../services/subscription.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class SubscriptionController {
  /**
   * POST /api/subscription/subscribe
   */
  static subscribe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = (req.auth?.userId || req.user?._id)?.toString();
    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized access', null, 401);
    }

    const { plan } = req.body;
    const subscription = await SubscriptionService.subscribe(userId, plan);

    return ApiResponse.success(res, `Subscribed to ${plan} plan successfully`, subscription);
  });

  /**
   * GET /api/subscription/me
   */
  static getSubscriptionMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = (req.auth?.userId || req.user?._id)?.toString();
    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized access', null, 401);
    }

    const subscription = await SubscriptionService.getSubscriptionMe(userId);

    return ApiResponse.success(res, 'User subscription details retrieved', subscription);
  });
}

export default SubscriptionController;
