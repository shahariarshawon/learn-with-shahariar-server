import mongoose from 'mongoose';
import Quiz from '../models/Quiz.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import CourseProgress from '../models/CourseProgress.js';
import { ApiError } from '../utils/apiError.js';

export class QuizService {
  static async getQuiz({ courseId, chapterId, userId }) {
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw new ApiError(400, 'Invalid courseId');
    }

    if (!chapterId) {
      throw new ApiError(400, 'chapterId is required');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const user = await User.findById(userId);
    const isEnrolled = user?.enrolledCourses?.some(
      (id) => id.toString() === courseId
    );

    if (!user || !isEnrolled) {
      throw new ApiError(403, 'Not enrolled in course');
    }

    const chapter = course.courseContent.find(
      (ch) => ch.chapterId === chapterId
    );

    if (!chapter) {
      throw new ApiError(404, 'Chapter not found');
    }

    const progress = await CourseProgress.findOne({ userId, courseId });
    const completedLectures = progress?.lectureCompleted || [];
    const chapterLectureIds = chapter.chapterContent.map(
      (lecture) => lecture.lectureId
    );

    const isChapterCompleted = chapterLectureIds.every((lectureId) =>
      completedLectures.includes(lectureId)
    );

    if (!isChapterCompleted) {
      throw new ApiError(403, 'Quiz locked. Complete this chapter first.');
    }

    const quiz = await Quiz.findOne({ courseId, chapterId });
    if (!quiz) {
      throw new ApiError(404, 'Quiz not created yet for this chapter');
    }

    return quiz;
  }

  static async createQuiz({ educatorId, courseId, chapterId, title, questions }) {
    if (!courseId || !chapterId || !title) {
      throw new ApiError(400, 'courseId, chapterId, and title are required');
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      throw new ApiError(400, 'Invalid courseId');
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      throw new ApiError(400, 'At least one question is required');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    if (course.educator !== educatorId) {
      throw new ApiError(403, 'You are not allowed to create quiz for this course');
    }

    const chapterExists = course.courseContent.some(
      (ch) => ch.chapterId === chapterId
    );

    if (!chapterExists) {
      throw new ApiError(404, 'Selected chapter does not exist in this course');
    }

    const existing = await Quiz.findOne({ courseId, chapterId });
    if (existing) {
      throw new ApiError(409, 'Quiz already exists for this chapter');
    }

    const quiz = await Quiz.create({
      courseId,
      chapterId,
      title,
      questions,
    });

    return quiz;
  }
}

export default QuizService;
