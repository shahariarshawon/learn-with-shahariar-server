import VideoProgress from '../models/VideoProgress.js';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import User from '../models/User.js';
import WatchHistory from '../models/WatchHistory.js';
import { VideoAccessError } from '../utils/errors.js';
import {
  IVideoAccessResponse,
  IWatchProgressPayload,
  IContinueWatchingResponse,
} from '../types/video.types.js';

export class VideoService {
  /**
   * Generates secure video access data payload
   */
  static async getVideoAccessData(
    userId: string,
    videoAccessContext: any
  ): Promise<IVideoAccessResponse> {
    const user = await User.findById(userId).select('email').lean();
    const studentEmail = user?.email || '';

    const { lessonId, lesson, course, permissions } = videoAccessContext;

    const videoUrl =
      lesson?.videoUrl ||
      lesson?.lectureUrl ||
      'https://stream.learnwithshahariar.com/default-video.mp4';

    return {
      lessonId,
      videoUrl,
      studentEmail,
      permissions,
      lesson: {
        title: lesson?.title || lesson?.lectureTitle || 'Untitled Lesson',
        duration: lesson?.duration || lesson?.lectureDuration || 0,
        courseId: course?._id?.toString() || lesson?.courseId?.toString() || '',
        moduleId: lesson?.moduleId || '',
      },
    };
  }

  /**
   * Updates student video watch progress and syncs lesson completion with Enrollment
   */
  static async updateWatchProgress(
    userId: string,
    payload: IWatchProgressPayload
  ) {
    const { lessonId, watchTime, lastPosition, completed } = payload;

    // Resolve courseId from lesson
    let courseId: string | null = null;

    if (lessonId.match(/^[0-9a-fA-F]{24}$/)) {
      const standaloneLesson = await Lesson.findById(lessonId).lean();
      if (standaloneLesson) {
        courseId = standaloneLesson.courseId.toString();
      }
    }

    if (!courseId) {
      const parentCourse = await Course.findOne({
        $or: [
          { 'modules.lessons.lessonId': lessonId },
          { 'modules.lessons._id': lessonId },
          { 'courseContent.chapterContent.lectureId': lessonId },
        ],
      }).lean();

      if (parentCourse) {
        courseId = parentCourse._id.toString();
      }
    }

    if (!courseId) {
      throw new VideoAccessError('Course not found for the specified lesson', 404);
    }

    // Upsert VideoProgress document
    const updateData: any = {
      studentId: userId,
      courseId,
      lessonId,
      watchTime,
      lastPosition,
    };

    if (typeof completed === 'boolean') {
      updateData.completed = completed;
    }

    const videoProgress = await VideoProgress.findOneAndUpdate(
      { studentId: userId, lessonId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    // Also sync WatchHistory for backward compatibility
    await WatchHistory.findOneAndUpdate(
      { studentId: userId, lessonId },
      {
        $set: {
          studentId: userId,
          courseId,
          lessonId,
          lastPosition,
          watchTime,
          isCompleted: completed ?? false,
          lastWatchedAt: new Date(),
        },
      },
      { upsert: true }
    ).catch(() => null);

    // If video marked as completed or position indicates completion, sync with Enrollment
    if (completed) {
      await this.syncEnrollmentCompletion(userId, courseId, lessonId);
    }

    return videoProgress;
  }

  /**
   * Syncs lesson completion with Enrollment model & recalculates progress %
   */
  private static async syncEnrollmentCompletion(
    studentId: string,
    courseId: string,
    lessonId: string
  ) {
    const enrollment = await Enrollment.findOne({ studentId, courseId });
    if (!enrollment) return;

    // Add lessonId to completedLessons if not present
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
    }

    // Calculate total lessons in course
    const course = await Course.findById(courseId).lean();
    let totalLessons = 0;

    if (course?.modules && course.modules.length > 0) {
      for (const mod of course.modules) {
        totalLessons += mod.lessons?.length || 0;
      }
    } else {
      totalLessons = await Lesson.countDocuments({ courseId });
    }

    if (totalLessons === 0) totalLessons = 1;

    const progressPercent = Math.min(
      100,
      Math.round((enrollment.completedLessons.length / totalLessons) * 100)
    );

    enrollment.progress = progressPercent;
    enrollment.lastAccessedLesson = lessonId;
    enrollment.lastAccessedAt = new Date();

    if (progressPercent === 100) {
      enrollment.status = 'completed';
    }

    await enrollment.save();
  }

  /**
   * Retrieves student's last watched video for Continue Watching playback
   */
  static async getContinueWatchingData(userId: string): Promise<IContinueWatchingResponse | null> {
    const lastProgress = await VideoProgress.findOne({ studentId: userId })
      .sort({ updatedAt: -1 })
      .lean();

    if (!lastProgress) {
      return null;
    }

    const course = await Course.findById(lastProgress.courseId).lean();
    if (!course) return null;

    // Find lesson details
    let lessonTitle = 'Resume Lesson';
    if (course.modules) {
      for (const mod of course.modules) {
        for (const les of mod.lessons || []) {
          const lesAny = les as any;
          const lesId = lesAny.lessonId || lesAny._id?.toString() || lesAny.lectureId;
          if (lesId === lastProgress.lessonId) {
            lessonTitle = lesAny.title || lesAny.lectureTitle || lessonTitle;
            break;
          }
        }
      }
    }

    return {
      lessonId: lastProgress.lessonId,
      lessonTitle,
      lastPosition: lastProgress.lastPosition || 0,
      watchTime: lastProgress.watchTime || 0,
      course: {
        courseId: course._id.toString(),
        title: course.courseTitle || (course as any).title || '',
        slug: course.slug || '',
        thumbnail: course.courseThumbnail || (course as any).thumbnail || '',
      },
    };
  }
}

export default VideoService;
