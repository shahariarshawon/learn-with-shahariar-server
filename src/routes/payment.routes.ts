import { Router } from 'express';
import PaymentController from '../controllers/payment.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/rbac.middleware.js';

const paymentRouter: Router = Router();

// Protect payment routes with authentication
paymentRouter.use(authenticateUser as any);

/**
 * POST /api/payment/create-checkout
 */
paymentRouter.post('/create-checkout', PaymentController.createCheckout as any);

/**
 * POST /api/payment/verify
 */
paymentRouter.post('/verify', PaymentController.verifyPayment as any);

/**
 * POST /api/payment/refund (Admin Guard)
 */
paymentRouter.post('/refund', authorizeRole('admin') as any, PaymentController.processRefund as any);

export default paymentRouter;
