import { Router } from 'express';
import { AnalyticsController } from '@/controllers/analytics.controller';
import { authenticate } from '@/middlewares/auth';
import { authorize } from '@/middlewares/roles';
import { Role } from '@prisma/client';

const router = Router();

// Market Intelligence (public for all exchange nodes)
router.get('/intelligence', authenticate, AnalyticsController.getMarketIntelligence);

// Admin dashboard overview
router.get('/admin-overview', authenticate, authorize(Role.ADMIN), AnalyticsController.getAdminOverview);

export default router;
