import { Router } from 'express';
import { MarketController } from '@/controllers/market.controller';
import { authenticate } from '@/middlewares/auth';
import { authorize } from '@/middlewares/roles';
import { Role } from '@prisma/client';

const router = Router();

router.get('/rates', MarketController.listRates);

// Seeding endpoint (restricted to admin)
router.post('/rates/seed', authenticate, authorize(Role.ADMIN), MarketController.seedRates);

export default router;
