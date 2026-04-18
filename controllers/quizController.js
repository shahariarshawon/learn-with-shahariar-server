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

        const course = await Course.findById(courseId);
        if (!course) {
            return res.json({ success: false, message: "Course not found" });
        }

        const user = await User.findById(userId);
        if (!user || !user.enrolledCourses.includes(courseId)) {
            return res.json({ success: false, message: "Not enrolled in course" });
        }

        const progress = await CourseProgress.findOne({ userId, courseId });

        if (!progress?.completed) {
            return res.json({
                success: false,
                message: "Quiz locked. Complete course first",
            });
        }

        const quiz = await Quiz.findOne({ courseId, chapterId });

        if (!quiz) {
            return res.json({
                success: false,
                message: "Quiz not created yet",
            });
        }

        return res.json({ success: true, quiz });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};
export const createQuiz = async (req, res) => {
    try {
        const { courseId, chapterId, title, questions } = req.body;

        if (!courseId || !chapterId || !title) {
            return res.json({
                success: false,
                message: "courseId, chapterId and title are required",
            });
        }

        // 🔥 prevent duplicate quiz per chapter
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

        return res.json({ success: true, quiz });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};