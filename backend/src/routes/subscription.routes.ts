import { Router } from 'express';
import { SubscriptionController } from '@/controllers/subscription.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

// Stripe checkouts
router.post('/stripe/checkout', authenticate, SubscriptionController.createStripeCheckout);
router.post('/stripe/verify', authenticate, SubscriptionController.verifyStripePayment);

// Razorpay checkouts
router.post('/razorpay/order', authenticate, SubscriptionController.createRazorpayOrder);
router.post('/razorpay/verify', authenticate, SubscriptionController.verifyRazorpayPayment);

export default router;
