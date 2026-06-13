import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import auctionRoutes from './auction.routes';
import marketRoutes from './market.routes';
import aiRoutes from './ai.routes';
import exportRoutes from './export.routes';
import logisticsRoutes from './logistics.routes';
import subscriptionRoutes from './subscription.routes';
import analyticsRoutes from './analytics.routes';
import adminRoutes from './admin.routes';
import agriRoutes from './agri.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/auctions', auctionRoutes);
router.use('/market', marketRoutes);
router.use('/ai', aiRoutes);
router.use('/export', exportRoutes);
router.use('/logistics', logisticsRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/agri', agriRoutes);

export default router;
