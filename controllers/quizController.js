import { Quiz } from "../models/Quiz.js";
import { CourseProgress } from "../models/CourseProgress.js";
import Course from "../models/Course.js";
import User from "../models/User.js";
import mongoose from "mongoose";

export const getQuiz = async (req, res) => {
  try {
    const { courseId, chapterId } = req.params;
    const userId = req.auth.userId;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.json({ success: false, message: "Invalid courseId" });
    }

    if (!chapterId) {
      return res.json({ success: false, message: "chapterId is required" });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.json({ success: false, message: "Course not found" });
    }

    const user = await User.findById(userId);

    const isEnrolled = user?.enrolledCourses?.some(
      (id) => id.toString() === courseId
    );

    if (!user || !isEnrolled) {
      return res.json({ success: false, message: "Not enrolled in course" });
    }

    const chapter = course.courseContent.find(
      (ch) => ch.chapterId === chapterId
    );

    if (!chapter) {
      return res.json({ success: false, message: "Chapter not found" });
    }

    const progress = await CourseProgress.findOne({ userId, courseId });

    // If your CourseProgress has lectureCompleted array, this checks chapter completion
    const completedLectures = progress?.lectureCompleted || [];

    const chapterLectureIds = chapter.chapterContent.map(
      (lecture) => lecture.lectureId
    );

    const isChapterCompleted = chapterLectureIds.every((lectureId) =>
      completedLectures.includes(lectureId)
    );

    if (!isChapterCompleted) {
      return res.json({
        success: false,
        message: "Quiz locked. Complete this chapter first.",
      });
    }

    const quiz = await Quiz.findOne({ courseId, chapterId });

    if (!quiz) {
      return res.json({
        success: false,
        message: "Quiz not created yet for this chapter",
      });
    }

    return res.json({ success: true, quiz });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
};

export const createQuiz = async (req, res) => {
  try {
    const educatorId = req.auth.userId;
    const { courseId, chapterId, title, questions } = req.body;

    if (!courseId || !chapterId || !title) {
      return res.json({
        success: false,
        message: "courseId, chapterId and title are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.json({ success: false, message: "Invalid courseId" });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.json({
        success: false,
        message: "At least one question is required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.json({ success: false, message: "Course not found" });
    }

    if (course.educator !== educatorId) {
      return res.json({
        success: false,
        message: "You are not allowed to create quiz for this course",
      });
    }

    const chapterExists = course.courseContent.some(
      (ch) => ch.chapterId === chapterId
    );

    if (!chapterExists) {
      return res.json({
        success: false,
        message: "Selected chapter does not exist in this course",
      });
    }

    const existing = await Quiz.findOne({ courseId, chapterId });

    if (existing) {
      return res.json({
        success: false,
        message: "Quiz already exists for this chapter",
      });
    }

    const quiz = await Quiz.create({
      courseId,
      chapterId,
      title,
      questions,
    });

    return res.json({
      success: true,
      message: "Quiz created successfully",
      quiz,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.json({
        success: false,
        message: "Quiz already exists for this chapter",
      });
    }

    return res.json({ success: false, message: err.message });
  }
};