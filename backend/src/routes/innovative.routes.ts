import { Router } from 'express';
import { InnovativeController } from '@/controllers/innovative.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

// Apply auth middleware to all innovative routes
router.use(authenticate);

// 1. Seller Verification Flow
router.post('/verification', InnovativeController.requestVerification);
router.get('/verification', InnovativeController.getVerificationStatus);
router.patch('/verification/:userId/approve', InnovativeController.adminApproveVerification);

// 2. Crop Quality Grading System
router.post('/grading/:productId', InnovativeController.gradeCrop);
router.get('/grading/:productId', InnovativeController.getCropGrading);

// 3. Warehouse Storage Space
router.post('/warehouse', InnovativeController.listWarehouseSpace);
router.get('/warehouse', InnovativeController.getWarehouseSpaces);
router.post('/warehouse/book', InnovativeController.bookWarehouse);
router.get('/warehouse/bookings', InnovativeController.getWarehouseBookings);

// 4. Logistics Marketplace
router.post('/logistics', InnovativeController.registerCarrier);
router.get('/logistics', InnovativeController.getCarriers);
router.post('/logistics/book', InnovativeController.bookTransport);
router.get('/logistics/bookings', InnovativeController.getTransportBookings);

// 5. Demand Forecast Dashboard
router.get('/forecasts', InnovativeController.getDemandForecasts);

// 6 & 7. Bulk Purchase & Procurement Requests
router.post('/bulk-procurement', InnovativeController.postBulkRequirement);
router.get('/bulk-procurement', InnovativeController.getBulkRequirements);
router.post('/bulk-procurement/quote', InnovativeController.submitFarmerQuotation);
router.get('/bulk-procurement/:requirementId/quotes', InnovativeController.getQuotationsForRequirement);

// 8. Trade Financing Module
router.post('/finance', InnovativeController.applyForFinancing);
router.get('/finance', InnovativeController.getFinanceApplications);

// 9. Commission-Free Direct Contacts
router.get('/direct-contact/:productId', InnovativeController.getDirectContact);

// 10. Crop Inventory Analytics
router.get('/inventory/analytics', InnovativeController.getFarmerInventoryAnalytics);

export default router;
