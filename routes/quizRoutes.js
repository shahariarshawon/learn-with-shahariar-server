import express from "express";
import { createQuiz, getQuiz } from "../controllers/quizController.js";
import { clerkMiddleware } from "@clerk/express";

const router = express.Router();

router.post("/create", clerkMiddleware(), createQuiz);

// chapter-wise quiz route
router.get("/:courseId/:chapterId", clerkMiddleware(), getQuiz);

export default router;