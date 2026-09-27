import express, { Router } from 'express';
import authController from './auth.controller.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { loginSchema, registerSchema } from './auth.validation.js';
import { authLimiter } from '../../middleware/rateLimiter.middleware.js';
import { authenticateUser } from '../../middleware/auth.middleware.js';

const authRouter: Router = express.Router();

authRouter.post('/register', authLimiter, validateRequest(registerSchema), authController.register);
authRouter.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
authRouter.post('/refresh', authController.refreshToken);
authRouter.get('/me', authenticateUser, authController.getMe);

export default authRouter;
