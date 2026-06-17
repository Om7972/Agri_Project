import Stripe from 'stripe';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import prisma from '@/config/db';
import { logger } from '@/utils/logger';
import { SubscriptionTier, PaymentGateway } from '@prisma/client';
import { BadRequestError } from '@/utils/apiErrors';

// Initialize Stripe (Mocked if no key provided)
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

// Initialize Razorpay (Mocked if no keys provided)
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
const razorpay = razorpayKeyId && razorpayKeySecret ? new Razorpay({
  key_id: razorpayKeyId,
  key_secret: razorpayKeySecret,
}) : null;

export class SubscriptionService {
  /**
   * Get price for subscription tier
   */
  private static getTierDetails(tier: SubscriptionTier) {
    switch (tier) {
      case 'STARTER':
        return { price: 999, name: 'MandiPrime Starter Plan' };
      case 'PROFESSIONAL':
        return { price: 2999, name: 'MandiPrime Pro Plan' };
      case 'ENTERPRISE':
        return { price: 9999, name: 'MandiPrime Enterprise Plan' };
      default:
        throw new BadRequestError('Invalid subscription tier.');
    }
  }

  /**
   * Initiate checkout session for Stripe
   */
  public static async createStripeSession(userId: string, tier: SubscriptionTier, successUrl: string, cancelUrl: string) {
    if (!stripe) {
      logger.warn('Stripe secret key missing. Simulating checkout session...');
      // Simulated Stripe URL
      return {
        sessionId: 'simulated_stripe_session_id',
        url: `${successUrl}?session_id=simulated_stripe_session_id&tier=${tier}`,
      };
    }

    const { price, name } = this.getTierDetails(tier);

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name,
                description: 'MandiPrime Agricultural SaaS Access',
              },
              unit_amount: price * 100, // in paise/cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}&tier=${tier}`,
        cancel_url: cancelUrl,
        metadata: {
          userId,
          tier,
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      logger.error('Error creating Stripe session:', error);
      throw error;
    }
  }

  /**
   * Initiate Razorpay Order
   */
  public static async createRazorpayOrder(userId: string, tier: SubscriptionTier) {
    const { price } = this.getTierDetails(tier);

    if (!razorpay) {
      logger.warn('Razorpay credentials missing. Simulating order generation...');
      return {
        orderId: `order_sim_${Math.random().toString(36).substring(7)}`,
        amount: price,
        currency: 'INR',
      };
    }

    try {
      const order = await razorpay.orders.create({
        amount: price * 100, // paise
        currency: 'INR',
        receipt: `receipt_sub_${userId.substring(0, 8)}`,
        notes: {
          userId,
          tier,
        },
      });

      return {
        orderId: order.id,
        amount: price,
        currency: 'INR',
      };
    } catch (error) {
      logger.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  /**
   * Verify Razorpay Payment Signature and activate subscription
   */
  public static async verifyRazorpayPayment(data: {
    userId: string;
    tier: SubscriptionTier;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const { price } = this.getTierDetails(data.tier);

    if (!razorpay) {
      logger.warn('Razorpay disabled. Bypassing verification for sandbox environment...');
      return this.activateSubscription(data.userId, data.tier, price, 'RAZORPAY', data.razorpayOrderId, data.razorpayPaymentId);
    }

    const body = data.razorpayOrderId + '|' + data.razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', razorpayKeySecret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== data.razorpaySignature) {
      throw new BadRequestError('Payment signature verification failed.');
    }

    return this.activateSubscription(data.userId, data.tier, price, 'RAZORPAY', data.razorpayOrderId, data.razorpayPaymentId);
  }

  /**
   * Complete Stripe checkout session validation (via Webhook or Redirect fallback)
   */
  public static async verifyStripePayment(userId: string, sessionId: string, tier: SubscriptionTier) {
    const { price } = this.getTierDetails(tier);

    if (!stripe || sessionId === 'simulated_stripe_session_id') {
      logger.warn('Bypassing Stripe session verification...');
      return this.activateSubscription(userId, tier, price, 'STRIPE', sessionId, 'stripe_payment_mock');
    }

    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        throw new BadRequestError('Session is not paid.');
      }

      return this.activateSubscription(
        userId,
        tier,
        price,
        'STRIPE',
        session.id,
        session.payment_intent as string || 'pi_unknown'
      );
    } catch (error) {
      logger.error('Error verifying Stripe session:', error);
      throw error;
    }
  }

  /**
   * Database activation utility
   */
  private static async activateSubscription(
    userId: string,
    tier: SubscriptionTier,
    price: number,
    gateway: PaymentGateway,
    gatewayOrderId?: string,
    gatewayPaymentId?: string
  ) {
    const durationDays = 30;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(startDate.getDate() + durationDays);

    const result = await prisma.$transaction(async (tx) => {
      // Deactivate current active subscriptions for this user
      await tx.subscription.updateMany({
        where: { userId, status: 'ACTIVE' },
        data: { status: 'CANCELLED' },
      });

      // Create new subscription record
      const subscription = await tx.subscription.create({
        data: {
          userId,
          tier,
          price,
          status: 'ACTIVE',
          startDate,
          endDate,
        },
      });

      // Create payment transaction audit
      await tx.transaction.create({
        data: {
          userId,
          subscriptionId: subscription.id,
          amount: price,
          gateway,
          gatewayOrderId,
          gatewayPaymentId,
          status: 'SUCCESS',
        },
      });

      return subscription;
    });

    logger.info(`Subscription ${result.id} tier ${tier} successfully activated for user ${userId}`);
    return result;
  }
}
