import express, { Router } from 'express';
import studentController from '../controllers/student.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const studentRouter: Router = express.Router();

studentRouter.get('/dashboard', authenticateUser, studentController.getStudentDashboard);

export default studentRouter;
