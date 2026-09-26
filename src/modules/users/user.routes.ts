import { Router } from 'express';
import {
  getUserData,
  userEnrolledCourses,
  purchaseCourse,
  updateUserCourseProgress,
  getUserCourseProgress,
  addUserRating,
  updateUserAfterPayment,
} from './user.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateUserRating, validateCourseProgress } from './user.validation.js';

const router = Router();

router.get('/data', requireAuth, getUserData);
router.get('/enrolled-courses', requireAuth, userEnrolledCourses);
router.post('/purchase', requireAuth, purchaseCourse);
router.post('/update-course-progress', requireAuth, validateCourseProgress, updateUserCourseProgress);
router.post('/get-course-progress', requireAuth, getUserCourseProgress);
router.post('/add-rating', requireAuth, validateUserRating, addUserRating);
router.post('/update-user-after-payment', requireAuth, updateUserAfterPayment);

export default router;
