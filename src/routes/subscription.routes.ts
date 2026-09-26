import { Router } from 'express';
import SubscriptionController from '../controllers/subscription.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const subscriptionRouter: Router = Router();

subscriptionRouter.use(authenticateUser as any);

/**
 * POST /api/subscription/subscribe
 */
subscriptionRouter.post('/subscribe', SubscriptionController.subscribe as any);

/**
 * GET /api/subscription/me
 */
subscriptionRouter.get('/me', SubscriptionController.getSubscriptionMe as any);

export default subscriptionRouter;
