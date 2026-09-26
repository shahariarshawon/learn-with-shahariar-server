import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Revenue from '../models/Revenue.js';
import Transaction from '../models/Transaction.js';

export class AnalyticsService {
  /**
   * Calculates overall platform metrics and percentage growth trends
   */
  static async getPlatformAnalytics() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // 1. User Growth Metrics
    const totalUsers = await User.countDocuments();
    const usersLast30Days = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
    const usersPrior30Days = await User.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo },
    });

    const userGrowthRate =
      usersPrior30Days > 0
        ? Math.round(((usersLast30Days - usersPrior30Days) / usersPrior30Days) * 100)
        : usersLast30Days > 0
        ? 100
        : 0;

    // 2. Course Growth Metrics
    const totalCourses = await Course.countDocuments();
    const coursesLast30Days = await Course.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // 3. Revenue Growth Metrics
    const totalRevenueAgg = await Revenue.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    const recentRevenueAgg = await Revenue.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const revenueLast30Days = recentRevenueAgg[0]?.total || 0;

    const priorRevenueAgg = await Revenue.aggregate([
      { $match: { createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);
    const revenuePrior30Days = priorRevenueAgg[0]?.total || 0;

    const revenueGrowthRate =
      revenuePrior30Days > 0
        ? Math.round(((revenueLast30Days - revenuePrior30Days) / revenuePrior30Days) * 100)
        : revenueLast30Days > 0
        ? 100
        : 0;

    // 4. Enrollment Trends (Grouped by month for last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const enrollmentTrends = await Enrollment.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return {
      overview: {
        totalUsers,
        totalCourses,
        totalRevenue,
        usersLast30Days,
        coursesLast30Days,
        revenueLast30Days,
      },
      growth: {
        userGrowthRate,
        revenueGrowthRate,
      },
      enrollmentTrends: enrollmentTrends.map((t) => ({
        month: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
        enrollments: t.count,
      })),
    };
  }
}

export default AnalyticsService;
