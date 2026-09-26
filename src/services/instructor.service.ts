import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Revenue from '../models/Revenue.js';
import Analytics from '../models/Analytics.js';
import { ApiError } from '../utils/apiError.js';

export class InstructorService {
  /**
   * Aggregates Instructor Dashboard Data (Total Courses, Students, Revenue, Rating)
   */
  static async getInstructorDashboardData(instructorId: string) {
    // 1. Total Courses owned by instructor
    const courses = await Course.find({ educator: instructorId }).lean();
    const totalCourses = courses.length;
    const courseIds = courses.map((c) => c._id);

    // 2. Total Enrolled Students across instructor's courses
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } }).lean();
    const uniqueStudentIds = new Set(enrollments.map((e) => e.studentId.toString()));
    const totalStudents = uniqueStudentIds.size;

    // 3. Total Revenue earned by instructor
    const revenueAgg = await Revenue.aggregate([
      { $match: { instructorId: instructorId } },
      { $group: { _id: null, totalEarning: { $sum: '$instructorEarning' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.totalEarning || 0;

    // 4. Average Rating across instructor's courses
    let totalRatingsSum = 0;
    let totalRatingsCount = 0;

    for (const c of courses) {
      for (const r of c.courseRatings || []) {
        if (typeof r.rating === 'number') {
          totalRatingsSum += r.rating;
          totalRatingsCount++;
        }
      }
    }

    const averageRating =
      totalRatingsCount > 0
        ? Number((totalRatingsSum / totalRatingsCount).toFixed(1))
        : 0;

    return {
      totalCourses,
      totalStudents,
      totalRevenue,
      averageRating,
    };
  }

  /**
   * Retrieves all courses managed by an instructor
   */
  static async getInstructorCourses(instructorId: string) {
    return await Course.find({ educator: instructorId }).sort({ createdAt: -1 }).lean();
  }

  /**
   * Updates course status (draft, published, archived) for an instructor's course
   */
  static async updateCourseStatus(instructorId: string, courseId: string, status: string) {
    const course = await Course.findOne({ _id: courseId, educator: instructorId });
    if (!course) {
      throw new ApiError(404, 'Course not found or you do not have permission to modify it');
    }

    if (!['draft', 'published', 'archived'].includes(status)) {
      throw new ApiError(400, 'Invalid course status. Allowed: draft, published, archived');
    }

    course.status = status as any;
    course.isPublished = status === 'published';
    await course.save();

    return course;
  }

  /**
   * Fetches detailed student roster enrolled in an instructor's courses
   */
  static async getInstructorStudents(instructorId: string) {
    const courses = await Course.find({ educator: instructorId }).select('_id courseTitle').lean();
    const courseIds = courses.map((c) => c._id);

    const courseMap = new Map<string, string>();
    courses.forEach((c) => courseMap.set(c._id.toString(), c.courseTitle));

    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
      .populate('studentId', 'name email profileImage imageUrl')
      .populate('courseId', 'courseTitle title')
      .sort({ createdAt: -1 })
      .lean();

    return enrollments.map((e: any) => {
      const student = e.studentId || {};
      const courseObj = e.courseId || {};

      return {
        enrollmentId: e._id,
        studentId: student._id || student.id,
        studentName: student.name || 'Student',
        email: student.email || '',
        profileImage: student.profileImage || student.imageUrl || '',
        course: {
          courseId: courseObj._id || e.courseId,
          title: courseObj.courseTitle || courseObj.title || courseMap.get(e.courseId?.toString()) || '',
        },
        progress: e.progress || 0,
        status: e.status,
        enrollmentDate: e.enrolledAt || e.createdAt,
      };
    });
  }

  /**
   * Retrieves deep analytics for a specific course (views, enrollments, completion rate, revenue)
   */
  static async getCourseAnalytics(instructorId: string, courseId: string) {
    const course = await Course.findOne({ _id: courseId, educator: instructorId }).lean();
    if (!course) {
      throw new ApiError(404, 'Course not found or you do not have permission to view its analytics');
    }

    // 1. Views
    const analyticsAgg = await Analytics.aggregate([
      { $match: { courseId: course._id } },
      { $group: { _id: null, totalViews: { $sum: '$viewsCount' } } },
    ]);
    const viewsCount = analyticsAgg[0]?.totalViews || 0;

    // 2. Enrollments
    const enrollments = await Enrollment.find({ courseId }).lean();
    const enrollmentsCount = enrollments.length;

    // 3. Completion Rate
    const completedCount = enrollments.filter((e) => e.progress === 100 || e.status === 'completed').length;
    const completionRate =
      enrollmentsCount > 0
        ? Math.round((completedCount / enrollmentsCount) * 100)
        : 0;

    // 4. Revenue generated by this course
    const revenueAgg = await Revenue.aggregate([
      { $match: { courseId: course._id } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' }, instructorEarning: { $sum: '$instructorEarning' } } },
    ]);

    const revenue = revenueAgg[0]?.totalRevenue || 0;
    const instructorEarning = revenueAgg[0]?.instructorEarning || 0;

    return {
      courseId,
      courseTitle: course.courseTitle,
      viewsCount,
      enrollmentsCount,
      completionRate,
      revenue,
      instructorEarning,
    };
  }
}

export default InstructorService;
