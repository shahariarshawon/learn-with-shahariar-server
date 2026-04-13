import express from "express";
import { createQuiz, getQuiz } from "../controllers/quizController.js";
import { clerkMiddleware } from "@clerk/express";

const router = express.Router();

router.post("/create", clerkMiddleware(), createQuiz);
router.get("/:courseId", clerkMiddleware(), getQuiz);

export default router;