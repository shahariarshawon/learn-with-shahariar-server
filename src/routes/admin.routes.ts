import { Router } from 'express';
import AdminController from '../controllers/admin.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/rbac.middleware.js';

const adminRouter: Router = Router();

// Protect all admin routes with Authentication & Strict Admin RBAC Guard
adminRouter.use(authenticateUser);
adminRouter.use(authorizeRole('admin'));

/**
 * Dashboard & Analytics
 */
adminRouter.get('/dashboard', AdminController.getDashboard);
adminRouter.get('/metrics', AdminController.getDashboard);
adminRouter.get('/analytics', AdminController.getAnalytics);

/**
 * User Management
 */
adminRouter.get('/users', AdminController.getUsers);
adminRouter.patch('/users/:userId/role', AdminController.updateUserRole);
adminRouter.patch('/users/:userId/status', AdminController.updateUserStatus);

/**
 * Course Moderation
 */
adminRouter.get('/courses/pending', AdminController.getPendingCourses);
adminRouter.patch('/courses/:courseId/approve', AdminController.approveCourse);
adminRouter.patch('/courses/:courseId/reject', AdminController.rejectCourse);
adminRouter.patch('/courses/:courseId/moderation', AdminController.updateModeration);

/**
 * Payment & Refund Management
 */
adminRouter.get('/transactions', AdminController.getTransactions);
adminRouter.get('/refunds', AdminController.getRefunds);
adminRouter.get('/payments/stats', AdminController.getPaymentStats);

export default adminRouter;
