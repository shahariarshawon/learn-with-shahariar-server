import { Webhook } from 'svix';
import Stripe from 'stripe';
import User from '../models/User.js';
import Purchase from '../models/Purchase.js';
import Course from '../models/Course.js';
import { env } from '../config/env.js';

export const clerkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(env.CLERK_WEBHOOK_SECRET);
    const payload = JSON.stringify(req.body);

    await whook.verify(payload, {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    });

    const { data, type } = req.body;

    switch (type) {
      case 'user.created': {
        const userData = {
          _id: data.id,
          email: data.email_addresses?.[0]?.email_address || '',
          name: (data.first_name || '') + ' ' + (data.last_name || ''),
          imageUrl: data.image_url || '',
          profileImage: data.image_url || '',
        };
        await User.create(userData);
        return res.json({});
      }

      case 'user.updated': {
        const userData = {
          email: data.email_addresses?.[0]?.email_address || '',
          name: (data.first_name || '') + ' ' + (data.last_name || ''),
          imageUrl: data.image_url || '',
          profileImage: data.image_url || '',
        };
        await User.findByIdAndUpdate(data.id, userData);
        return res.json({});
      }

      case 'user.deleted': {
        await User.findByIdAndDelete(data.id);
        return res.json({});
      }

      default:
        return res.status(400).json({ success: false, message: 'Unhandled event type' });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const stripeWebhooks = async (request, response) => {
  const sig = request.headers['stripe-signature'];
  const stripeInstance = new Stripe(env.STRIPE_SECRET_KEY);

  let event;
  try {
    event = stripeInstance.webhooks.constructEvent(request.body, sig, env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return response.status(400).send(`Webhook Error: ${err.message}`);
  }

  const handlePaymentSuccess = async (paymentIntent) => {
    try {
      const paymentIntentId = paymentIntent.id;
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      if (!session.data.length) {
        console.error('[Stripe Webhook] No session data found for payment intent:', paymentIntentId);
        return;
      }

      const { purchaseId } = session.data[0].metadata;
      const purchaseData = await Purchase.findById(purchaseId);

      if (!purchaseData) {
        console.error('[Stripe Webhook] No purchase found for ID:', purchaseId);
        return;
      }

      const userData = await User.findById(purchaseData.userId);
      const courseData = await Course.findById(purchaseData.courseId.toString());

      if (!userData || !courseData) {
        console.error('[Stripe Webhook] User or Course not found');
        return;
      }

      courseData.enrolledStudents.push(userData._id);
      await courseData.save();

      userData.enrolledCourses.push(courseData._id);
      await userData.save();

      purchaseData.status = 'completed';
      await purchaseData.save();
    } catch (error) {
      console.error('[Stripe Webhook] Error handling payment success:', error);
    }
  };

  const handlePaymentFailed = async (paymentIntent) => {
    try {
      const paymentIntentId = paymentIntent.id;
      const session = await stripeInstance.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      if (!session.data.length) {
        console.error('[Stripe Webhook] No session data found for failed payment intent:', paymentIntentId);
        return;
      }

      const { purchaseId } = session.data[0].metadata;
      const purchaseData = await Purchase.findById(purchaseId);

      if (!purchaseData) {
        console.error('[Stripe Webhook] No purchase found for ID:', purchaseId);
        return;
      }

      purchaseData.status = 'failed';
      await purchaseData.save();
    } catch (error) {
      console.error('[Stripe Webhook] Error handling payment failure:', error);
    }
  };

  switch (event.type) {
    case 'payment_intent.succeeded':
      await handlePaymentSuccess(event.data.object);
      break;

    case 'payment_intent.payment_failed':
      await handlePaymentFailed(event.data.object);
      break;

    default:
      console.log(`[Stripe Webhook] Unhandled event type ${event.type}`);
  }

  response.json({ received: true });
};

export default {
  clerkWebhooks,
  stripeWebhooks,
};
