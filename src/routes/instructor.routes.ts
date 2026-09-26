import { Router } from 'express';
import InstructorController from '../controllers/instructor.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/rbac.middleware.js';

const instructorRouter: Router = Router();

// Protect all instructor routes with Authentication & RBAC Guard
instructorRouter.use(authenticateUser as any);
instructorRouter.use(authorizeRole('instructor', 'admin') as any);

/**
 * GET /api/instructor/dashboard
 */
instructorRouter.get('/dashboard', InstructorController.getDashboard as any);

/**
 * GET /api/instructor/courses
 */
instructorRouter.get('/courses', InstructorController.getCourses as any);

/**
 * PATCH /api/instructor/courses/:courseId/status
 */
instructorRouter.patch('/courses/:courseId/status', InstructorController.updateCourseStatus as any);

/**
 * GET /api/instructor/students
 */
instructorRouter.get('/students', InstructorController.getStudents as any);

/**
 * GET /api/instructor/analytics/:courseId
 */
instructorRouter.get('/analytics/:courseId', InstructorController.getCourseAnalytics as any);

/**
 * GET /api/instructor/revenue
 */
instructorRouter.get('/revenue', InstructorController.getRevenue as any);

export default instructorRouter;
