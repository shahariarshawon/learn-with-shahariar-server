import express, { Router } from 'express';
import learningController from '../controllers/learning.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const learningRouter: Router = express.Router();

learningRouter.get('/continue', authenticateUser, learningController.continueLearning);

export default learningRouter;
