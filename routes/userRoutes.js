import express from "express";
import { clerkMiddleware } from "@clerk/express";

import {
  addUserRating,
  getUserCourseProgress,
  getUserData,
  purchaseCourse,
  updateUserAfterPayment,
  updateUserCourseProgress,
  userEnrolledCourses,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/data", clerkMiddleware(), getUserData);
userRouter.get("/enrolled-courses", clerkMiddleware(), userEnrolledCourses);
userRouter.post("/purchase", clerkMiddleware(), purchaseCourse);
userRouter.post("/update-course-progress", clerkMiddleware(), updateUserCourseProgress);
userRouter.post("/get-course-progress", clerkMiddleware(), getUserCourseProgress);
userRouter.post("/add-rating", clerkMiddleware(), addUserRating);
userRouter.post("/update-course", clerkMiddleware(), updateUserAfterPayment);

export default userRouter;