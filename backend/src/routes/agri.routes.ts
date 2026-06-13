import { Router } from 'express';
import { AgriController } from '@/controllers/agri.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

// AI Smart Search (Public or Authenticated, let's keep public/accessible)
router.get('/search', AgriController.smartSearch);

// Saved Searches (Authenticated)
router.post('/saved-searches', authenticate, AgriController.createSavedSearch);
router.get('/saved-searches', authenticate, AgriController.listSavedSearches);
router.delete('/saved-searches/:id', authenticate, AgriController.deleteSavedSearch);

// Price Alerts (Authenticated)
router.post('/price-alerts', authenticate, AgriController.createPriceAlert);
router.get('/price-alerts', authenticate, AgriController.listPriceAlerts);
router.delete('/price-alerts/:id', authenticate, AgriController.deletePriceAlert);

// Smart Negotiation Chat (Authenticated)
router.post('/negotiations', authenticate, AgriController.createNegotiation);
router.get('/negotiations', authenticate, AgriController.getNegotiations);
router.get('/negotiations/:id', authenticate, AgriController.getNegotiationHistory);
router.post('/negotiations/:id/messages', authenticate, AgriController.sendNegotiationMessage);
router.patch('/negotiations/:id/status', authenticate, AgriController.updateNegotiationStatus);

// Digital Contract (Authenticated)
router.get('/contracts/:orderId', authenticate, AgriController.getContract);
router.post('/contracts/:orderId', authenticate, AgriController.generateContract);

// Trust Score (Public/Authenticated)
router.get('/trust-score', authenticate, AgriController.getUserTrustScore);
router.get('/trust-score/:userId', AgriController.getUserTrustScore);

export default router;
