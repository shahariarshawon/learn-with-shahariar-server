import Stripe from 'stripe';
import Course from '../courses/course.model.js';
import Purchase from '../payment/purchase.model.js';
import User from './user.model.js';
import CourseProgress from '../../models/CourseProgress.js';
import { clerkClient } from '@clerk/express';
import { ApiError } from '../../utils/apiError.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import { ICourseRating } from '../courses/course.types.js';

export class UserService {
  static async getUserData(userId?: string) {
    if (!userId) {
      throw new ApiError(401, 'Unauthorized. Please login again.');
    }

    let user = await User.findById(userId);

    if (!user) {
      let clerkUser: any = null;
      try {
        clerkUser = await (clerkClient.users as any).getUser(userId);
      } catch (clerkError: any) {
        logger.error(`[UserService] Clerk user fetch failed: ${clerkError.message}`);
      }

      const firstName = clerkUser?.firstName || '';
      const lastName = clerkUser?.lastName || '';
      const name =
        `${firstName} ${lastName}`.trim() ||
        clerkUser?.fullName ||
        clerkUser?.username ||
        clerkUser?.primaryEmailAddress?.emailAddress ||
        'Unnamed User';

      const email =
        clerkUser?.primaryEmailAddress?.emailAddress ||
        clerkUser?.emailAddresses?.[0]?.emailAddress ||
        '';

      const avatar = clerkUser?.imageUrl || clerkUser?.profileImageUrl || '';

      user = await User.create({
        _id: userId,
        name,
        email,
        imageUrl: avatar,
        profileImage: avatar,
        enrolledCourses: [],
      });
    }

    return user;
  }

  static async getUserEnrolledCourses(userId?: string) {
    if (!userId) {
      throw new ApiError(401, 'Unauthorized. Please login again.');
    }

    let userData = await User.findById(userId).populate('enrolledCourses');

    if (!userData) {
      userData = await User.create({
        _id: userId,
        name: 'Unnamed User',
        email: '',
        imageUrl: '',
        enrolledCourses: [],
      });
      userData = await User.findById(userId).populate('enrolledCourses');
    }

    return userData?.enrolledCourses || [];
  }

  static async purchaseCourse({
    courseId,
    origin,
    userId,
  }: {
    courseId: string;
    origin?: string;
    userId: string;
  }) {
    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      throw new ApiError(404, 'User or Course data not found');
    }

    const discountRate = courseData.discount || 0;
    const amount = Number(
      (courseData.coursePrice - (discountRate * courseData.coursePrice) / 100).toFixed(2)
    );

    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount,
    };

    const newPurchase = await Purchase.create(purchaseData);

    const stripeInstance = new Stripe(env.STRIPE_SECRET_KEY);
    const currency = env.CURRENCY?.toLowerCase() || 'usd';

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        price_data: {
          currency,
          product_data: {
            name: courseData.courseTitle,
          },
          unit_amount: Math.floor(amount) * 100,
        },
        quantity: 1,
      },
    ];

    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/my-enrollments?purchaseId=${newPurchase._id}`,
      cancel_url: `${origin}/`,
      line_items,
      mode: 'payment',
      metadata: {
        purchaseId: newPurchase._id.toString(),
      },
    });

    return {
      session_url: session.url,
      purchaseId: newPurchase._id,
    };
  }

  static async updateCourseProgress({
    userId,
    courseId,
    lectureId,
  }: {
    userId: string;
    courseId: string;
    lectureId: string;
  }) {
    let progressData = await CourseProgress.findOne({ userId, courseId });

    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        return { message: 'Lecture Already Completed' };
      }
      progressData.lectureCompleted.push(lectureId);
      progressData.completed = true;
      await progressData.save();
    } else {
      progressData = await CourseProgress.create({
        userId,
        courseId,
        lectureCompleted: [lectureId],
        completed: true,
      });
    }

    return { message: 'Progress Updated' };
  }

  static async getUserCourseProgress({
    userId,
    courseId,
  }: {
    userId: string;
    courseId: string;
  }) {
    const progressData = await CourseProgress.findOne({ userId, courseId });
    return progressData;
  }

  static async addRating({
    userId,
    courseId,
    rating,
  }: {
    userId: string;
    courseId: string;
    rating: number;
  }) {
    if (!courseId || !rating || rating < 1 || rating > 5) {
      throw new ApiError(400, 'Invalid rating details');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const user = await User.findById(userId);
    if (!user || !user.enrolledCourses?.some((cId: any) => cId.toString() === courseId.toString())) {
      throw new ApiError(403, 'User has not purchased this course');
    }

    if (!course.courseRatings) {
      course.courseRatings = [];
    }

    const existingRatingIndex = course.courseRatings.findIndex(
      (r: ICourseRating) => r.userId === userId
    );

    if (existingRatingIndex > -1) {
      course.courseRatings[existingRatingIndex].rating = rating;
    } else {
      course.courseRatings.push({ userId, rating });
    }

    await course.save();
    return { message: 'Rating Added' };
  }

  static async updateUserAfterPayment({ purchaseId }: { purchaseId: string }) {
    if (!purchaseId) {
      throw new ApiError(400, 'Purchase ID is required');
    }

    const purchase = await Purchase.findById(purchaseId);
    if (!purchase) {
      throw new ApiError(404, 'Purchase record not found');
    }

    const user = await User.findByIdAndUpdate(
      purchase.userId,
      { $addToSet: { enrolledCourses: purchase.courseId } },
      { new: true }
    );

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    purchase.status = 'completed';
    await purchase.save();

    return { message: 'Course successfully added to your enrollments!' };
  }
}

export default UserService;
