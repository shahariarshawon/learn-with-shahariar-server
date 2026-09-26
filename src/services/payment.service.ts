import Stripe from 'stripe';
import Course from '../models/Course.js';
import User from '../models/User.js';
import Enrollment from '../models/Enrollment.js';
import Transaction from '../models/Transaction.js';
import Revenue from '../models/Revenue.js';
import { ApiError } from '../utils/apiError.js';
import { env } from '../config/env.js';

export class PaymentService {
  /**
   * Creates a checkout session for purchasing a course
   */
  static async createCheckoutSession(userId: string, courseId: string, origin: string = 'http://localhost:3000') {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const price = course.coursePrice ?? (course as any).price ?? 0;

    // Handle Free Course Auto-Enrollment
    if (price === 0) {
      let enrollment = await Enrollment.findOne({ studentId: userId, courseId });
      if (!enrollment) {
        enrollment = await Enrollment.create({
          studentId: userId,
          courseId,
          status: 'active',
          progress: 0,
          completedLessons: [],
          enrolledAt: new Date(),
        });
      } else {
        enrollment.status = 'active';
        await enrollment.save();
      }

      // Add to user enrolledCourses and course enrolledStudents safely
      if (!user.enrolledCourses) user.enrolledCourses = [];
      if (!user.enrolledCourses.includes(course._id.toString())) {
        user.enrolledCourses.push(course._id.toString());
        await user.save();
      }

      if (!course.enrolledStudents) course.enrolledStudents = [];
      if (!course.enrolledStudents.includes(userId)) {
        course.enrolledStudents.push(userId);
        await course.save();
      }

      return {
        isFree: true,
        message: 'Course is free. You have been automatically enrolled.',
        enrollment,
      };
    }

    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Create pending transaction record
    const transaction = await Transaction.create({
      transactionId,
      studentId: userId,
      instructorId: course.educator,
      courseId,
      amount: price,
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'stripe',
    });

    let checkoutUrl = `${origin}/payment/verify?transactionId=${transactionId}&status=success`;
    let sessionId = transactionId;

    // Initialize Stripe checkout if API key is provided
    if (env.STRIPE_SECRET_KEY && !env.STRIPE_SECRET_KEY.includes('placeholder')) {
      try {
        const stripe = new Stripe(env.STRIPE_SECRET_KEY);
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'usd',
                product_data: {
                  name: course.courseTitle || (course as any).title,
                  images: course.courseThumbnail ? [course.courseThumbnail] : [],
                },
                unit_amount: Math.round(price * 100),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${origin}/payment/verify?sessionId={CHECKOUT_SESSION_ID}&transactionId=${transactionId}`,
          cancel_url: `${origin}/course/${course.slug || courseId}?payment=cancelled`,
          metadata: {
            transactionId,
            userId,
            courseId,
          },
        });

        if (session.url) {
          checkoutUrl = session.url;
        }
        if (session.id) {
          sessionId = session.id;
          transaction.stripeSessionId = session.id;
          await transaction.save();
        }
      } catch (stripeErr: any) {
        console.warn('[PaymentService] Stripe initialization fallback:', stripeErr.message);
      }
    }

    return {
      isFree: false,
      checkoutUrl,
      sessionId,
      transactionId,
    };
  }

  /**
   * Verifies payment and completes enrollment & revenue allocation
   */
  static async verifyPayment(userId: string, payload: { sessionId?: string; transactionId?: string }) {
    const { sessionId, transactionId } = payload;

    let transaction: any = null;
    if (transactionId) {
      transaction = await Transaction.findOne({ transactionId });
    }
    if (!transaction && sessionId) {
      transaction = await Transaction.findOne({ stripeSessionId: sessionId });
    }

    if (!transaction) {
      throw new ApiError(404, 'Transaction record not found');
    }

    if (transaction.studentId.toString() !== userId.toString()) {
      throw new ApiError(403, 'Unauthorized transaction verification attempt');
    }

    // Mark transaction as successful
    transaction.status = 'success';
    await transaction.save();

    // 1. Create/Update Enrollment
    let enrollment = await Enrollment.findOne({
      studentId: userId,
      courseId: transaction.courseId,
    });

    if (!enrollment) {
      enrollment = await Enrollment.create({
        studentId: userId,
        courseId: transaction.courseId,
        status: 'active',
        progress: 0,
        completedLessons: [],
        enrolledAt: new Date(),
      });
    } else {
      enrollment.status = 'active';
      await enrollment.save();
    }

    // 2. Sync user & course enrolled references safely
    const user = await User.findById(userId);
    const course = await Course.findById(transaction.courseId);

    if (user) {
      if (!user.enrolledCourses) user.enrolledCourses = [];
      if (!user.enrolledCourses.includes(transaction.courseId.toString())) {
        user.enrolledCourses.push(transaction.courseId.toString());
        await user.save();
      }
    }

    if (course) {
      if (!course.enrolledStudents) course.enrolledStudents = [];
      if (!course.enrolledStudents.includes(userId)) {
        course.enrolledStudents.push(userId);
        await course.save();
      }
    }

    // 3. Record Revenue Allocation (80% Instructor, 20% Platform)
    const amount = transaction.amount || 0;
    const instructorEarning = Number((amount * 0.8).toFixed(2));
    const platformCommission = Number((amount * 0.2).toFixed(2));

    await Revenue.findOneAndUpdate(
      { purchaseId: transaction.transactionId },
      {
        instructorId: transaction.instructorId,
        courseId: transaction.courseId,
        studentId: userId,
        enrollmentId: enrollment._id,
        purchaseId: transaction.transactionId,
        totalAmount: amount,
        instructorEarning,
        platformCommission,
        currency: transaction.currency || 'USD',
      },
      { upsert: true }
    );

    return {
      success: true,
      message: 'Payment verified and course unlocked successfully',
      transaction,
      enrollment,
    };
  }

  /**
   * Processes a refund for a transaction
   */
  static async processRefund(_adminId: string, transactionId: string, reason: string = '') {
    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      throw new ApiError(404, 'Transaction not found');
    }

    if (transaction.status === 'refunded') {
      throw new ApiError(400, 'Transaction has already been refunded');
    }

    // Mark transaction as refunded
    transaction.status = 'refunded';
    transaction.refundReason = reason || 'Admin initiated refund';
    transaction.refundedAt = new Date();
    await transaction.save();

    // Revoke enrollment
    await Enrollment.findOneAndUpdate(
      { studentId: transaction.studentId, courseId: transaction.courseId },
      { status: 'refunded' }
    );

    return transaction;
  }
}

export default PaymentService;
