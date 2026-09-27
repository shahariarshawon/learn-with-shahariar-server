import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express.types.js';
import AdminService from '../services/admin.service.js';
import AnalyticsService from '../services/analytics.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class AdminController {
  /**
   * GET /api/admin/dashboard
   */
  static getDashboard = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const data = await AdminService.getAdminDashboardData();
    return ApiResponse.success(res, 'Admin dashboard metrics retrieved successfully', { metrics: data, ...data });
  });

  /**
   * GET /api/admin/users
   */
  static getUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { search, role, page, limit } = req.query;

    const data = await AdminService.getUsers({
      search: typeof search === 'string' ? search : undefined,
      role: typeof role === 'string' ? role : undefined,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });

    return ApiResponse.success(res, 'Users retrieved successfully', data);
  });

  /**
   * PATCH /api/admin/users/:userId/role
   */
  static updateUserRole = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = String(req.params.userId);
    const { role } = req.body;

    const user = await AdminService.updateUserRole(userId, role);
    return ApiResponse.success(res, `User role updated to ${role}`, user);
  });

  /**
   * PATCH /api/admin/users/:userId/status
   */
  static updateUserStatus = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const userId = String(req.params.userId);
    const { isActive } = req.body;

    const user = await AdminService.updateUserStatus(userId, Boolean(isActive));
    return ApiResponse.success(
      res,
      `User account ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    );
  });

  /**
   * GET /api/admin/courses/pending
   */
  static getPendingCourses = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const courses = await AdminService.getPendingCourses();
    return ApiResponse.success(res, 'Pending courses retrieved successfully', courses);
  });

  /**
   * PATCH /api/admin/courses/:courseId/approve
   */
  static approveCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const courseId = String(req.params.courseId);
    const course = await AdminService.approveCourse(courseId);
    return ApiResponse.success(res, 'Course approved and published successfully', course);
  });

  /**
   * PATCH /api/admin/courses/:courseId/reject
   */
  static rejectCourse = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const courseId = String(req.params.courseId);
    const { rejectionReason } = req.body;

    const course = await AdminService.rejectCourse(courseId, rejectionReason);
    return ApiResponse.success(res, 'Course rejected successfully', course);
  });

  /**
   * PATCH /api/admin/courses/:courseId/moderation
   */
  static updateModeration = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const courseId = String(req.params.courseId);
    const { status, rejectionReason } = req.body;

    if (status === 'approved') {
      const course = await AdminService.approveCourse(courseId);
      return ApiResponse.success(res, 'Course approved and published successfully', course);
    } else {
      const course = await AdminService.rejectCourse(courseId, rejectionReason || 'Course did not meet platform guidelines');
      return ApiResponse.success(res, 'Course moderation updated successfully', course);
    }
  });

  /**
   * GET /api/admin/transactions
   */
  static getTransactions = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const data = await AdminService.getTransactions(page, limit);
    return ApiResponse.success(res, 'Transactions retrieved successfully', data);
  });

  /**
   * GET /api/admin/refunds
   */
  static getRefunds = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const data = await AdminService.getRefunds(page, limit);
    return ApiResponse.success(res, 'Refunded transactions retrieved successfully', data);
  });

  /**
   * GET /api/admin/payments/stats
   */
  static getPaymentStats = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const stats = await AdminService.getPaymentStats();
    return ApiResponse.success(res, 'Payment statistics retrieved successfully', stats);
  });

  /**
   * GET /api/admin/analytics
   */
  static getAnalytics = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
    const analytics = await AnalyticsService.getPlatformAnalytics();
    return ApiResponse.success(res, 'Platform analytics retrieved successfully', analytics);
  });
}

export default AdminController;
