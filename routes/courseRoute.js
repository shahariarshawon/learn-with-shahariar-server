import express from "express";
import { addChapter, addLecture, getAllCourse, getCourseId, updateCourse } from "../controllers/courseController.js";
import { getEducatorCourses } from "../controllers/educatorController.js";
import { clerkMiddleware } from "@clerk/express";

const courseRouter = express.Router()

courseRouter.get('/all', getAllCourse);
courseRouter.get("/educator-courses", clerkMiddleware(), getEducatorCourses);
courseRouter.post("/add-lecture",clerkMiddleware(),addLecture);
courseRouter.post("/add-chapter",clerkMiddleware(),addChapter);

courseRouter.get('/:id', getCourseId);
courseRouter.put("/update/:courseId", updateCourse);

export default courseRouter;