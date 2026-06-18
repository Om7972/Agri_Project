import { Request, Response, NextFunction } from 'express';
import { NewFeaturesService } from '@/services/newfeatures.service';
import { sendResponse } from '@/utils/responseHandlers';

export class NewFeaturesController {

  // ==================== 1. REVERSE AUCTION MARKETPLACE ====================
  public static async createReverseAuction(req: Request, res: Response, next: NextFunction) {
    try {
      const buyerId = req.user!.id;
      const result = await NewFeaturesService.createReverseAuction(buyerId, req.body);
      return sendResponse(res, 201, 'Reverse auction request created successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async getReverseAuctions(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await NewFeaturesService.getReverseAuctions();
      return sendResponse(res, 200, 'Reverse auctions retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async placeReverseBid(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user!.id;
      const result = await NewFeaturesService.placeReverseBid(farmerId, req.body);
      return sendResponse(res, 201, 'Reverse bid placed successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async getBidsForAuction(req: Request, res: Response, next: NextFunction) {
    try {
      const { auctionId } = req.params;
      const result = await NewFeaturesService.getBidsForAuction(auctionId);
      return sendResponse(res, 200, 'Bids for reverse auction retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async selectReverseAuctionWinner(req: Request, res: Response, next: NextFunction) {
    try {
      const buyerId = req.user!.id;
      const { auctionId } = req.params;
      const { bidId } = req.body;
      const result = await NewFeaturesService.selectReverseAuctionWinner(buyerId, auctionId, bidId);
      return sendResponse(res, 200, 'Winner selected and reverse auction completed.', result);
    } catch (error) {
      next(error);
    }
  }

  // ==================== 2. COMMUNITY MARKETPLACE ====================
  public static async createCommunityPost(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const result = await NewFeaturesService.createCommunityPost(userId, userEmail, req.body);
      return sendResponse(res, 201, 'Community post created successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async getCommunityPosts(req: Request, res: Response, next: NextFunction) {
    try {
      const { communityName } = req.query;
      const result = await NewFeaturesService.getCommunityPosts(communityName as string);
      return sendResponse(res, 200, 'Community posts retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const { postId } = req.params;
      const { content } = req.body;
      const result = await NewFeaturesService.addComment(userId, userEmail, postId, content);
      return sendResponse(res, 201, 'Comment added successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async likePost(req: Request, res: Response, next: NextFunction) {
    try {
      const { postId } = req.params;
      const result = await NewFeaturesService.likePost(postId);
      return sendResponse(res, 200, 'Post liked successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  // ==================== 3. AGRICULTURAL EVENTS PLATFORM ====================
  public static async createAgriEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await NewFeaturesService.createAgriEvent(req.body);
      return sendResponse(res, 201, 'Agricultural event created successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async getAgriEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await NewFeaturesService.getAgriEvents();
      return sendResponse(res, 200, 'Events retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async registerForEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userEmail = req.user!.email;
      const { eventId } = req.params;
      const result = await NewFeaturesService.registerForEvent(userId, userEmail, eventId);
      return sendResponse(res, 201, 'Event registration successful.', result);
    } catch (error) {
      next(error);
    }
  }

  // ==================== 4. SMART RFQ SYSTEM ====================
  public static async generateRFQQuotationPDF(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user!.id;
      const result = await NewFeaturesService.generateRFQQuotationPDF(farmerId, req.body);
      return sendResponse(res, 201, 'Quotation PDF generated successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  // ==================== 5. WAREHOUSE RECEIPT SYSTEM ====================
  public static async generateWarehouseReceipt(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user!.id;
      const farmerEmail = req.user!.email;
      const result = await NewFeaturesService.generateWarehouseReceipt(farmerId, farmerEmail, req.body);
      return sendResponse(res, 201, 'Warehouse receipt generated successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async getWarehouseReceipts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      const result = await NewFeaturesService.getWarehouseReceipts(userId, role);
      return sendResponse(res, 200, 'Warehouse receipts retrieved successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async requestWarehouseRelease(req: Request, res: Response, next: NextFunction) {
    try {
      const { receiptId } = req.params;
      const result = await NewFeaturesService.requestWarehouseRelease(receiptId);
      return sendResponse(res, 200, 'Warehouse release requested successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async approveWarehouseRelease(req: Request, res: Response, next: NextFunction) {
    try {
      const { receiptId } = req.params;
      const result = await NewFeaturesService.approveWarehouseRelease(receiptId);
      return sendResponse(res, 200, 'Warehouse release approved successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  // ==================== 6. COOPERATIVE GROUPS ====================
  public static async createCooperative(req: Request, res: Response, next: NextFunction) {
    try {
      const leaderId = req.user!.id;
      const leaderEmail = req.user!.email;
      const result = await NewFeaturesService.createCooperative(leaderId, leaderEmail, req.body);
      return sendResponse(res, 201, 'Cooperative group created successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async joinCooperative(req: Request, res: Response, next: NextFunction) {
    try {
      const farmerId = req.user!.id;
      const farmerEmail = req.user!.email;
      const { groupName } = req.body;
      const result = await NewFeaturesService.joinCooperative(farmerId, farmerEmail, groupName);
      return sendResponse(res, 200, 'Joined cooperative group successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async getCooperatives(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await NewFeaturesService.getCooperatives();
      return sendResponse(res, 200, 'Cooperative groups retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async addSharedInventory(req: Request, res: Response, next: NextFunction) {
    try {
      const { groupId } = req.params;
      const result = await NewFeaturesService.addSharedInventory(groupId, req.body);
      return sendResponse(res, 201, 'Shared inventory added successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  // ==================== 7. REFERRAL PROGRAM ====================
  public static async generateReferralCode(req: Request, res: Response, next: NextFunction) {
    try {
      const referrerId = req.user!.id;
      const referrerEmail = req.user!.email;
      const result = await NewFeaturesService.generateReferralCode(referrerId, referrerEmail);
      return sendResponse(res, 200, 'Referral code generated.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async completeReferralRegistration(req: Request, res: Response, next: NextFunction) {
    try {
      const referredId = req.user!.id;
      const referredEmail = req.user!.email;
      const { referralCode } = req.body;
      const result = await NewFeaturesService.completeReferralRegistration(referredId, referredEmail, referralCode);
      return sendResponse(res, 200, 'Referral link registered successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async getReferralLeaderboard(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await NewFeaturesService.getReferralLeaderboard();
      return sendResponse(res, 200, 'Referral leaderboard retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  // ==================== 8. NOTIFICATION PREFERENCES ====================
  public static async getNotificationPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await NewFeaturesService.getNotificationPreferences(userId);
      return sendResponse(res, 200, 'Notification preferences retrieved.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async updateNotificationPreferences(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await NewFeaturesService.updateNotificationPreferences(userId, req.body);
      return sendResponse(res, 200, 'Notification preferences updated.', result);
    } catch (error) {
      next(error);
    }
  }
}
