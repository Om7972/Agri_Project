import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '@/services/subscription.service';
import { AuditLogger } from '@/utils/auditLogger';
import { SubscriptionTier } from '@prisma/client';

export class SubscriptionController {
  /**
   * Initiate Stripe checkout session
   */
  public static async createStripeCheckout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tier, successUrl, cancelUrl } = req.body;
      const sessionData = await SubscriptionService.createStripeSession(
        req.user!.id,
        tier as SubscriptionTier,
        successUrl || 'http://localhost:3000/billing/success',
        cancelUrl || 'http://localhost:3000/billing/cancel'
      );

      res.status(200).json({
        success: true,
        data: sessionData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Initiate Razorpay Order
   */
  public static async createRazorpayOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tier } = req.body;
      const orderData = await SubscriptionService.createRazorpayOrder(
        req.user!.id,
        tier as SubscriptionTier
      );

      res.status(200).json({
        success: true,
        data: orderData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Razorpay Payment Signature
   */
  public static async verifyRazorpayPayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tier, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
      const subscription = await SubscriptionService.verifyRazorpayPayment({
        userId: req.user!.id,
        tier: tier as SubscriptionTier,
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature,
      });

      await AuditLogger.log({
        userId: req.user!.id,
        action: 'SUBSCRIBE_RAZORPAY',
        details: `Subscribed to ${tier} via Razorpay. SubID: ${subscription.id}`,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Razorpay subscription activated successfully.',
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Stripe Session Payment
   */
  public static async verifyStripePayment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { sessionId, tier } = req.body;
      const subscription = await SubscriptionService.verifyStripePayment(
        req.user!.id,
        sessionId,
        tier as SubscriptionTier
      );

      await AuditLogger.log({
        userId: req.user!.id,
        action: 'SUBSCRIBE_STRIPE',
        details: `Subscribed to ${tier} via Stripe. SubID: ${subscription.id}`,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Stripe subscription activated successfully.',
        data: subscription,
      });
    } catch (error) {
      next(error);
    }
  }
}
