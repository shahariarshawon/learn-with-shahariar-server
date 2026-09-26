import { Router } from 'express';
import AdminController from '../controllers/admin.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/rbac.middleware.js';

const adminRouter: Router = Router();

// Protect all admin routes with Authentication & Strict Admin RBAC Guard
adminRouter.use(authenticateUser as any);
adminRouter.use(authorizeRole('admin') as any);

/**
 * Dashboard & Analytics
 */
adminRouter.get('/dashboard', AdminController.getDashboard as any);
adminRouter.get('/analytics', AdminController.getAnalytics as any);

/**
 * User Management
 */
adminRouter.get('/users', AdminController.getUsers as any);
adminRouter.patch('/users/:userId/role', AdminController.updateUserRole as any);
adminRouter.patch('/users/:userId/status', AdminController.updateUserStatus as any);

/**
 * Course Moderation
 */
adminRouter.get('/courses/pending', AdminController.getPendingCourses as any);
adminRouter.patch('/courses/:courseId/approve', AdminController.approveCourse as any);
adminRouter.patch('/courses/:courseId/reject', AdminController.rejectCourse as any);

/**
 * Payment & Refund Management
 */
adminRouter.get('/transactions', AdminController.getTransactions as any);
adminRouter.get('/refunds', AdminController.getRefunds as any);
adminRouter.get('/payments/stats', AdminController.getPaymentStats as any);

export default adminRouter;
