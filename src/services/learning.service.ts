import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import Progress from '../models/Progress.js';
import WatchHistory from '../models/WatchHistory.js';
import Lesson from '../models/Lesson.js';
import { ApiError } from '../utils/apiError.js';

export class LearningService {
  /**
   * Calculate total lessons for a given course
   */
  private static async getTotalLessonsCount(courseId: string, course?: any): Promise<number> {
    if (course && course.modules && Array.isArray(course.modules)) {
      let count = 0;
      course.modules.forEach((mod: any) => {
        if (mod.lessons && Array.isArray(mod.lessons)) {
          count += mod.lessons.length;
        }
      });
      if (count > 0) return count;
    }
    const standaloneCount = await Lesson.countDocuments({ courseId });
    return standaloneCount || 1; // Fallback to 1 to prevent division by zero
  }

  /**
   * Mark lesson completed & update progress %
   */
  static async completeLesson({
    studentId,
    courseId,
    lessonId,
    watchTime = 0,
  }: {
    studentId: string;
    courseId: string;
    lessonId: string;
    watchTime?: number;
  }) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    // 1. Update Lesson Progress
    await Progress.findOneAndUpdate(
      { studentId, lessonId },
      {
        studentId,
        courseId,
        lessonId,
        completed: true,
        completedAt: new Date(),

        ...(watchTime > 0 ? { watchTime } : {}),
      },
      { upsert: true, new: true }
    );

    // 2. Find or Create Enrollment
    let enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) {
      enrollment = await Enrollment.create({
        studentId,
        courseId,
        completedLessons: [lessonId],
        lastAccessedLesson: lessonId,
        lastAccessedAt: new Date(),
        progress: 0,
        status: 'active',
      });
    } else {
      if (!enrollment.completedLessons.includes(lessonId)) {
        enrollment.completedLessons.push(lessonId);
      }
      enrollment.lastAccessedLesson = lessonId;
      enrollment.lastAccessedAt = new Date();
    }

    // 3. Calculate total lessons & percentage progress
    const totalLessons = await this.getTotalLessonsCount(courseId, course);
    const completedCount = enrollment.completedLessons.length;
    const progressPercentage = Math.min(100, Math.round((completedCount / totalLessons) * 100));

    enrollment.progress = progressPercentage;
    if (progressPercentage >= 100) {
      enrollment.status = 'completed';
    }

    await enrollment.save();

    const remainingLessons = Math.max(0, totalLessons - completedCount);

    return {
      progressPercentage,
      completedLessons: enrollment.completedLessons,
      remainingLessons,
      totalLessons,
      lastAccessedLesson: lessonId,
      status: enrollment.status,
    };
  }

  /**
   * Get student course progress
   */
  static async getCourseProgress({ studentId, courseId }: { studentId: string; courseId: string }) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const enrollment = await Enrollment.findOne({ studentId, courseId });
    const totalLessons = await this.getTotalLessonsCount(courseId, course);
    const completedLessons = enrollment?.completedLessons || [];
    const completedCount = completedLessons.length;
    const progressPercentage = enrollment?.progress ?? Math.min(100, Math.round((completedCount / totalLessons) * 100));
    const remainingLessons = Math.max(0, totalLessons - completedCount);

    return {
      progressPercentage,
      completedLessons,
      remainingLessons,
      totalLessons,
      lastAccessedLesson: enrollment?.lastAccessedLesson || '',
      status: enrollment?.status || 'active',
    };
  }

  /**
   * Continue Learning: Get student's last active course & playback position
   */
  static async continueLearning(studentId: string) {
    const lastEnrollment = await Enrollment.findOne({ studentId, status: { $ne: 'cancelled' } })
      .sort({ lastAccessedAt: -1 })
      .populate('courseId');

    if (!lastEnrollment || !lastEnrollment.courseId) {
      return null;
    }

    const course: any = lastEnrollment.courseId;
    const lastLessonId = lastEnrollment.lastAccessedLesson;

    let lastPosition = 0;
    let watchTime = 0;
    let lessonDetails: any = null;

    if (lastLessonId) {
      const history = await WatchHistory.findOne({ studentId, lessonId: lastLessonId });
      if (history) {
        lastPosition = history.lastPosition;
        watchTime = history.watchTime;
      }

      // Locate lesson in course modules
      if (course.modules && Array.isArray(course.modules)) {
        for (const mod of course.modules) {
          const found = mod.lessons?.find(
            (l: any) => l.lessonId === lastLessonId || l._id?.toString() === lastLessonId
          );
          if (found) {
            lessonDetails = found;
            break;
          }
        }
      }
    }

    return {
      course: {
        id: course._id,
        title: course.courseTitle || course.title,
        slug: course.slug,
        thumbnail: course.courseThumbnail || course.thumbnail,
        progress: lastEnrollment.progress,
      },
      lastAccessedLesson: {
        lessonId: lastLessonId || '',
        title: lessonDetails?.title || 'Next Lesson',
        videoUrl: lessonDetails?.videoUrl || '',
        duration: lessonDetails?.duration || 0,
        lastPosition,
        watchTime,
      },
    };
  }

  /**
   * Update video watch position
   */
  static async updateWatchPosition({
    studentId,
    courseId,
    lessonId,
    watchTime,
    lastPosition,
  }: {
    studentId: string;
    courseId: string;
    lessonId: string;
    watchTime: number;
    lastPosition: number;
  }) {
    // 1. Update Watch History
    await WatchHistory.findOneAndUpdate(
      { studentId, lessonId },
      { studentId, courseId, lessonId, watchTime, lastPosition, updatedAt: new Date() },
      { upsert: true, new: true }
    );

    // 2. Update Progress position
    await Progress.findOneAndUpdate(
      { studentId, lessonId },
      { studentId, courseId, lessonId, watchTime, lastPosition },
      { upsert: true }
    );

    // 3. Update Enrollment last accessed
    await Enrollment.findOneAndUpdate(
      { studentId, courseId },
      { lastAccessedLesson: lessonId, lastAccessedAt: new Date() }
    );

    return { message: 'Watch position updated successfully', lastPosition, watchTime };
  }
}

export default LearningService;
