import Enrollment from '../models/Enrollment.js';

export class StudentService {
  static async getDashboard(studentId: string) {
    const enrollments = await Enrollment.find({ studentId, status: { $ne: 'cancelled' } })
      .populate('courseId', 'courseTitle slug courseThumbnail category level duration educator')
      .sort({ lastAccessedAt: -1 });

    const validEnrollments = enrollments.filter((e: any) => e && e.courseId);

    const enrolledCourses = validEnrollments.map((e: any) => ({
      enrollmentId: e._id,
      course: e.courseId,
      progress: e.progress,
      status: e.status,
      completedLessonsCount: e.completedLessons?.length || 0,
      lastAccessedLesson: e.lastAccessedLesson,
      lastAccessedAt: e.lastAccessedAt,
      enrolledAt: e.enrolledAt,
    }));

    const recentlyAccessedCourses = enrolledCourses.slice(0, 5);
    const completedCourses = enrolledCourses.filter((c) => c.status === 'completed' || c.progress >= 100);

    const totalEnrolled = enrolledCourses.length;
    const totalCompleted = completedCourses.length;
    const totalProgressSum = enrolledCourses.reduce((sum, item) => sum + item.progress, 0);
    const averageProgress = totalEnrolled > 0 ? Math.round(totalProgressSum / totalEnrolled) : 0;

    return {
      enrolledCourses,
      recentlyAccessedCourses,
      completedCourses,
      overallStats: {
        totalEnrolled,
        totalCompleted,
        averageProgress,
      },
    };
  }
}

export default StudentService;
