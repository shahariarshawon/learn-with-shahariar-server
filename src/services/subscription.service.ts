import Subscription, { SubscriptionPlan } from '../models/Subscription.js';
import User from '../models/User.js';
import { ApiError } from '../utils/apiError.js';

export class SubscriptionService {
  /**
   * Subscribes user to FREE, PRO, or PREMIUM plan
   */
  static async subscribe(userId: string, plan: SubscriptionPlan) {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    let price = 0;
    let durationDays = 30;

    if (plan === 'PRO') {
      price = 19.99;
      durationDays = 30;
    } else if (plan === 'PREMIUM') {
      price = 49.99;
      durationDays = 365;
    } else {
      plan = 'FREE';
      price = 0;
      durationDays = 365;
    }

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + durationDays);

    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      {
        userId,
        plan,
        price,
        startDate,
        endDate,
        status: 'active',
      },
      { new: true, upsert: true }
    );

    return subscription;
  }

  /**
   * Fetches active user subscription details
   */
  static async getSubscriptionMe(userId: string) {
    let subscription = await Subscription.findOne({ userId, status: 'active' }).lean();

    if (!subscription) {
      return {
        userId,
        plan: 'FREE',
        price: 0,
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      };
    }

    // Check if subscription has expired
    if (new Date() > new Date(subscription.endDate)) {
      await Subscription.findByIdAndUpdate(subscription._id, { status: 'expired' });
      return {
        userId,
        plan: 'FREE',
        price: 0,
        status: 'expired',
        startDate: subscription.startDate,
        endDate: subscription.endDate,
      };
    }

    return subscription;
  }
}

export default SubscriptionService;
