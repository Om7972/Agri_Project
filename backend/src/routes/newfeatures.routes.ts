import { Router } from 'express';
import { NewFeaturesController } from '@/controllers/newfeatures.controller';
import { authenticate } from '@/middlewares/auth';

const router = Router();

// Apply auth middleware to all new feature routes
router.use(authenticate);

// 1. Reverse Auctions
router.post('/reverse-auctions', NewFeaturesController.createReverseAuction);
router.get('/reverse-auctions', NewFeaturesController.getReverseAuctions);
router.post('/reverse-auctions/bid', NewFeaturesController.placeReverseBid);
router.get('/reverse-auctions/:auctionId/bids', NewFeaturesController.getBidsForAuction);
router.post('/reverse-auctions/:auctionId/winner', NewFeaturesController.selectReverseAuctionWinner);

// 2. Crop Community Marketplace
router.post('/community/posts', NewFeaturesController.createCommunityPost);
router.get('/community/posts', NewFeaturesController.getCommunityPosts);
router.post('/community/posts/:postId/comments', NewFeaturesController.addComment);
router.post('/community/posts/:postId/like', NewFeaturesController.likePost);

// 3. Agricultural Events Platform
router.post('/events', NewFeaturesController.createAgriEvent);
router.get('/events', NewFeaturesController.getAgriEvents);
router.post('/events/:eventId/register', NewFeaturesController.registerForEvent);

// 4. Smart RFQ System (Quotation PDF)
router.post('/rfq/quotation', NewFeaturesController.generateRFQQuotationPDF);

// 5. Warehouse Receipt System
router.post('/warehouse/receipts', NewFeaturesController.generateWarehouseReceipt);
router.get('/warehouse/receipts', NewFeaturesController.getWarehouseReceipts);
router.patch('/warehouse/receipts/:receiptId/release-request', NewFeaturesController.requestWarehouseRelease);
router.patch('/warehouse/receipts/:receiptId/approve-release', NewFeaturesController.approveWarehouseRelease);

// 6. Cooperative Groups
router.post('/cooperatives', NewFeaturesController.createCooperative);
router.post('/cooperatives/join', NewFeaturesController.joinCooperative);
router.get('/cooperatives', NewFeaturesController.getCooperatives);
router.post('/cooperatives/:groupId/shared-inventory', NewFeaturesController.addSharedInventory);

// 7. Referral Program
router.post('/referral/code', NewFeaturesController.generateReferralCode);
router.post('/referral/redeem', NewFeaturesController.completeReferralRegistration);
router.get('/referral/leaderboard', NewFeaturesController.getReferralLeaderboard);

// 8. Notification Preferences
router.get('/notifications/preferences', NewFeaturesController.getNotificationPreferences);
router.put('/notifications/preferences', NewFeaturesController.updateNotificationPreferences);

export default router;
