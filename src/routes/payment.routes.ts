import { Router } from 'express';
import PaymentController from '../controllers/payment.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/rbac.middleware.js';

const paymentRouter: Router = Router();

// Protect payment routes with authentication
paymentRouter.use(authenticateUser);

/**
 * POST /api/payment/create-checkout
 */
paymentRouter.post('/create-checkout', PaymentController.createCheckout);

/**
 * POST /api/payment/verify
 */
paymentRouter.post('/verify', PaymentController.verifyPayment);

/**
 * POST /api/payment/refund (Admin Guard)
 */
paymentRouter.post('/refund', authorizeRole('admin'), PaymentController.processRefund);

export default paymentRouter;
