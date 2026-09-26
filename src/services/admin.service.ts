import User from '../models/User.js';
import Course from '../models/Course.js';
import Revenue from '../models/Revenue.js';
import Transaction from '../models/Transaction.js';
import { ApiError } from '../utils/apiError.js';
import { ROLES, normalizeRole } from '../constants/roles.js';

export class AdminService {
  /**
   * Aggregates Admin Dashboard System Data
   */
  static async getAdminDashboardData() {
    const totalUsers = await User.countDocuments();
    const students = await User.countDocuments({ role: { $in: ['student', 'user'] } });
    const instructors = await User.countDocuments({ role: { $in: ['instructor', 'educator'] } });
    const courses = await Course.countDocuments();

    const revenueAgg = await Revenue.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          platformCommission: { $sum: '$platformCommission' },
        },
      },
    ]);

    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const platformCommission = revenueAgg[0]?.platformCommission || 0;

    return {
      totalUsers,
      students,
      instructors,
      courses,
      totalRevenue,
      platformCommission,
    };
  }

  /**
   * User Management: Fetch, search, filter, and paginate users
   */
  static async getUsers(options: { search?: string; role?: string; page?: number; limit?: number }) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, Math.min(100, options.limit || 10));
    const skip = (page - 1) * limit;

    const query: any = {};

    if (options.search) {
      query.$or = [
        { name: { $regex: options.search, $options: 'i' } },
        { email: { $regex: options.search, $options: 'i' } },
      ];
    }

    if (options.role) {
      const normalized = normalizeRole(options.role);
      query.role = normalized;
    }

    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Update user role (student, instructor, admin)
   */
  static async updateUserRole(userId: string, role: string) {
    const normalized = normalizeRole(role);
    const user = await User.findById(userId);

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    user.role = normalized as any;
    await user.save();

    return user;
  }

  /**
   * Deactivate or activate user account
   */
  static async updateUserStatus(userId: string, isActive: boolean) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    (user as any).isActive = isActive;
    await user.save();

    return user;
  }

  /**
   * Moderation: Get pending courses awaiting admin approval
   */
  static async getPendingCourses() {
    return await Course.find({ approvalStatus: 'pending' })
      .populate('educator', 'name email profileImage')
      .sort({ createdAt: -1 })
      .lean();
  }

  /**
   * Approve a pending course
   */
  static async approveCourse(courseId: string) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    course.approvalStatus = 'approved';
    course.status = 'published';
    course.isPublished = true;
    await course.save();

    return course;
  }

  /**
   * Reject a course with reason
   */
  static async rejectCourse(courseId: string, rejectionReason: string) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    course.approvalStatus = 'rejected';
    course.rejectionReason = rejectionReason || 'Course does not meet quality guidelines';
    course.status = 'draft';
    course.isPublished = false;
    await course.save();

    return course;
  }

  /**
   * Payment Management: View system transactions
   */
  static async getTransactions(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const total = await Transaction.countDocuments();
    const transactions = await Transaction.find()
      .populate('studentId', 'name email')
      .populate('instructorId', 'name email')
      .populate('courseId', 'courseTitle')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Payment Management: View refunded transactions
   */
  static async getRefunds(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const query = { status: 'refunded' };
    const total = await Transaction.countDocuments(query);
    const refunds = await Transaction.find(query)
      .populate('studentId', 'name email')
      .populate('courseId', 'courseTitle')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    return {
      refunds,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Payment Statistics Overview
   */
  static async getPaymentStats() {
    const totalTransactions = await Transaction.countDocuments();
    const completedTransactions = await Transaction.countDocuments({ status: 'completed' });
    const refundedTransactions = await Transaction.countDocuments({ status: 'refunded' });

    const totalGrossAgg = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalRefundsAgg = await Transaction.aggregate([
      { $match: { status: 'refunded' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalGross = totalGrossAgg[0]?.total || 0;
    const totalRefunded = totalRefundsAgg[0]?.total || 0;
    const netRevenue = totalGross - totalRefunded;

    return {
      totalTransactions,
      completedTransactions,
      refundedTransactions,
      totalGross,
      totalRefunded,
      netRevenue,
    };
  }
}

export default AdminService;
