import { Router } from 'express';
import { LogisticsController } from '@/controllers/logistics.controller';
import { authenticate } from '@/middlewares/auth';
import { authorize } from '@/middlewares/roles';
import { Role } from '@prisma/client';

const router = Router();

// Truck bookings (Admin and Exporter)
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.EXPORTER),
  LogisticsController.createBooking
);

// Assigning shipments
router.post(
  '/assign',
  authenticate,
  authorize(Role.ADMIN, Role.EXPORTER),
  LogisticsController.assignShipment
);

// Status updates
router.patch(
  '/:id/status',
  authenticate,
  authorize(Role.ADMIN, Role.EXPORTER),
  LogisticsController.updateStatus
);

// GPS Coordinate tracking updates
router.patch(
  '/:id/location',
  authenticate,
  LogisticsController.updateLocation
);

// Retrieve details
router.get('/:id', authenticate, LogisticsController.getBooking);

// List bookings
router.get('/', authenticate, authorize(Role.ADMIN, Role.EXPORTER), LogisticsController.listBookings);

export default router;
