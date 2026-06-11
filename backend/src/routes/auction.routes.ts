import { Router } from 'express';
import { AuctionController } from '@/controllers/auction.controller';
import { authenticate } from '@/middlewares/auth';
import { authorize } from '@/middlewares/roles';
import { validate } from '@/middlewares/validator';
import { createAuctionSchema, placeBidSchema } from '@/validators/auctions';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', AuctionController.list);
router.get('/:id', AuctionController.getById);

// Protected routes
router.post(
  '/',
  authenticate,
  authorize(Role.FARMER, Role.EXPORTER, Role.ADMIN),
  validate(createAuctionSchema),
  AuctionController.create
);

router.post(
  '/:id/bids',
  authenticate,
  authorize(Role.BUYER, Role.EXPORTER, Role.ADMIN),
  validate(placeBidSchema),
  AuctionController.placeBid
);

export default router;
