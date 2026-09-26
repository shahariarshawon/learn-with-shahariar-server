import express, { Router } from 'express';
import { clerkWebhooks, stripeWebhooks } from '../controllers/webhook.controller.js';

const webhookRouter: Router = express.Router();

webhookRouter.post('/clerk', express.json(), clerkWebhooks);
webhookRouter.post('/stripe', express.raw({ type: 'application/json' }), stripeWebhooks);

export default webhookRouter;
