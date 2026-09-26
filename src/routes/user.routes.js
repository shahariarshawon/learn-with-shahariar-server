import express from 'express';
import userController from '../controllers/user.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { purchaseCourseSchema, updatePaymentSchema } from '../validators/payment.validator.js';

const userRouter = express.Router();

userRouter.get('/data', authenticateUser, userController.getUserData);
userRouter.get('/enrolled-courses', authenticateUser, userController.userEnrolledCourses);
userRouter.post(
  '/purchase',
  authenticateUser,
  validateRequest(purchaseCourseSchema),
  userController.purchaseCourse
);
userRouter.post('/update-course-progress', authenticateUser, userController.updateUserCourseProgress);
userRouter.post('/get-course-progress', authenticateUser, userController.getUserCourseProgress);
userRouter.post('/add-rating', authenticateUser, userController.addUserRating);
userRouter.post(
  '/update-course',
  authenticateUser,
  validateRequest(updatePaymentSchema),
  userController.updateUserAfterPayment
);

export default userRouter;
