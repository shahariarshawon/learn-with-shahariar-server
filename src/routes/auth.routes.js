import express from 'express';
import authController from '../controllers/auth.controller.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { loginSchema, registerSchema } from '../validators/auth.validator.js';
import { authLimiter } from '../middleware/rateLimiter.middleware.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const authRouter = express.Router();

authRouter.post('/register', authLimiter, validateRequest(registerSchema), authController.register);
authRouter.post('/login', authLimiter, validateRequest(loginSchema), authController.login);
authRouter.post('/refresh', authController.refreshToken);
authRouter.get('/me', authenticateUser, authController.getMe);

export default authRouter;
