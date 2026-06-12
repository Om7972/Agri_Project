import { Router } from 'express';
import { ExportController } from '@/controllers/export.controller';
import { authenticate } from '@/middlewares/auth';
import { authorize } from '@/middlewares/roles';
import { Role } from '@prisma/client';

const router = Router();

// Exporter and Admin can schedule shipments
router.post(
  '/',
  authenticate,
  authorize(Role.ADMIN, Role.EXPORTER),
  ExportController.createShipment
);

// Exporters/Farmers can upload certificates/invoices
router.post(
  '/document',
  authenticate,
  authorize(Role.ADMIN, Role.EXPORTER, Role.FARMER),
  ExportController.uploadDocument
);

// Admins verify documents
router.patch(
  '/document/:id/verify',
  authenticate,
  authorize(Role.ADMIN),
  ExportController.verifyDocument
);

// Retrieve shipment details (tracking)
router.get('/:id', authenticate, ExportController.getShipment);

// List shipments
router.get('/', authenticate, ExportController.listShipments);

export default router;
