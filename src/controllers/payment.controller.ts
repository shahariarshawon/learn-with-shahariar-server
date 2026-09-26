import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express.types.js';
import PaymentService from '../services/payment.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class PaymentController {
  /**
   * POST /api/payment/create-checkout
   * Creates payment checkout session for a course purchase
   */
  static createCheckout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = (req.auth?.userId || req.user?._id)?.toString();
    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized access', null, 401);
    }

    const { courseId } = req.body;
    const origin = req.headers.origin || 'http://localhost:3000';

    const sessionData = await PaymentService.createCheckoutSession(userId, courseId, origin);

    return ApiResponse.success(res, 'Checkout session created successfully', sessionData);
  });

  /**
   * POST /api/payment/verify
   * Verifies completed payment & unlocks course enrollment
   */
  static verifyPayment = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = (req.auth?.userId || req.user?._id)?.toString();
    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized access', null, 401);
    }

    const { sessionId, transactionId } = req.body;
    const verification = await PaymentService.verifyPayment(userId, { sessionId, transactionId });

    return ApiResponse.success(res, 'Payment verified successfully', verification);
  });

  /**
   * POST /api/payment/refund
   * Admin refund processor
   */
  static processRefund = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const adminId = (req.auth?.userId || req.user?._id)?.toString();
    if (!adminId) {
      return ApiResponse.error(res, 'Unauthorized access', null, 401);
    }

    const { transactionId, reason } = req.body;
    const refundedTx = await PaymentService.processRefund(adminId, transactionId, reason);

    return ApiResponse.success(res, 'Refund processed successfully', refundedTx);
  });
}

export default PaymentController;
