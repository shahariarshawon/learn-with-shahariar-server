import express, { Router } from 'express';
import educatorController from '../controllers/educator.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { protectEducator } from '../middleware/rbac.middleware.js';
import upload from '../middleware/upload.middleware.js';

const educatorRouter: Router = express.Router();

educatorRouter.get('/update-role', authenticateUser, educatorController.updateRoleToEducator);
educatorRouter.post(
  '/add-course',
  upload.single('image'),
  authenticateUser,
  protectEducator,
  educatorController.addCourse
);
educatorRouter.get('/courses', authenticateUser, protectEducator, educatorController.getEducatorCourses);
educatorRouter.get('/dashboard', authenticateUser, protectEducator, educatorController.educatorDashboardData);
educatorRouter.get(
  '/enrolled-students',
  authenticateUser,
  protectEducator,
  educatorController.getEnrolledStudentsData
);

export default educatorRouter;
