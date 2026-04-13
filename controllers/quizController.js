import { Quiz } from "../models/Quiz.js";
import { CourseProgress } from "../models/CourseProgress.js";
import Course from "../models/Course.js";
import User from "../models/User.js";

import mongoose from "mongoose";

export const getQuiz = async (req, res) => {
    try {
        const { courseId } = req.params;
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

        const quiz = await Quiz.findOne({ courseId });

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
        const { courseId, title, questions } = req.body;

        if (!courseId || !title) {
            return res.json({
                success: false,
                message: "courseId and title are required",
            });
        }

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.json({
                success: false,
                message: "At least one question is required",
            });
        }

        const quiz = await Quiz.create({
            courseId,
            title,
            questions,
        });

        return res.json({ success: true, quiz });
    } catch (err) {
        return res.json({ success: false, message: err.message });
    }
};