import { Router } from 'express';
import authRoutes from './auth.routes';
import productRoutes from './product.routes';
import orderRoutes from './order.routes';
import auctionRoutes from './auction.routes';
import marketRoutes from './market.routes';
import aiRoutes from './ai.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/auctions', auctionRoutes);
router.use('/market', marketRoutes);
router.use('/ai', aiRoutes);

export default router;
