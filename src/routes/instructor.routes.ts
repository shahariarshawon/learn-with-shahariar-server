import { Router } from 'express';
import InstructorController from '../controllers/instructor.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { authorizeRole } from '../middleware/rbac.middleware.js';

const instructorRouter: Router = Router();

// Protect all instructor routes with Authentication & RBAC Guard
instructorRouter.use(authenticateUser);
instructorRouter.use(authorizeRole('instructor', 'admin'));

/**
 * GET /api/instructor/dashboard
 */
instructorRouter.get('/dashboard', InstructorController.getDashboard);

/**
 * GET /api/instructor/courses
 */
instructorRouter.get('/courses', InstructorController.getCourses);

/**
 * PATCH /api/instructor/courses/:courseId/status
 */
instructorRouter.patch('/courses/:courseId/status', InstructorController.updateCourseStatus);

/**
 * GET /api/instructor/students
 */
instructorRouter.get('/students', InstructorController.getStudents);

/**
 * GET /api/instructor/analytics/:courseId
 */
instructorRouter.get('/analytics/:courseId', InstructorController.getCourseAnalytics);

/**
 * GET /api/instructor/revenue
 */
instructorRouter.get('/revenue', InstructorController.getRevenue);

export default instructorRouter;
