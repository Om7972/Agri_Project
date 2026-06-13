import { Request, Response, NextFunction } from 'express';
import { AgriService } from '@/services/agri.service';
import { sendResponse } from '@/utils/responseHandlers';
import { BadRequestError } from '@/utils/apiErrors';

export class AgriController {
  /**
   * AI Smart Search
   */
  public static async smartSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      if (!query) {
        throw new BadRequestError('Search query parameter "q" is required.');
      }
      const results = await AgriService.smartSearch(query);
      return sendResponse(res, 200, 'AI Smart Search completed successfully.', results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Saved Searches
   */
  public static async createSavedSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { query, filters } = req.body;
      if (!query) {
        throw new BadRequestError('Search query is required.');
      }
      const savedSearch = await AgriService.createSavedSearch(userId, query, filters);
      return sendResponse(res, 201, 'Search query saved successfully.', savedSearch);
    } catch (error) {
      next(error);
    }
  }

  public static async listSavedSearches(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const list = await AgriService.listSavedSearches(userId);
      return sendResponse(res, 200, 'Saved searches retrieved successfully.', list);
    } catch (error) {
      next(error);
    }
  }

  public static async deleteSavedSearch(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await AgriService.deleteSavedSearch(id, userId);
      return sendResponse(res, 200, 'Saved search deleted successfully.', null);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Price Alerts
   */
  public static async createPriceAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { cropType, targetPrice, condition } = req.body;
      if (!cropType || !targetPrice || !condition) {
        throw new BadRequestError('cropType, targetPrice, and condition are required.');
      }
      const alert = await AgriService.createPriceAlert(userId, cropType, parseFloat(targetPrice), condition);
      return sendResponse(res, 201, 'Price alert created successfully.', alert);
    } catch (error) {
      next(error);
    }
  }

  public static async listPriceAlerts(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const alerts = await AgriService.listPriceAlerts(userId);
      return sendResponse(res, 200, 'Price alerts retrieved successfully.', alerts);
    } catch (error) {
      next(error);
    }
  }

  public static async deletePriceAlert(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      await AgriService.deletePriceAlert(id, userId);
      return sendResponse(res, 200, 'Price alert deleted successfully.', null);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Smart Negotiation Chat
   */
  public static async createNegotiation(req: Request, res: Response, next: NextFunction) {
    try {
      const buyerId = req.user!.id;
      const { productId, targetPrice } = req.body;
      if (!productId || !targetPrice) {
        throw new BadRequestError('productId and targetPrice are required.');
      }
      const negotiation = await AgriService.createNegotiation(buyerId, productId, parseFloat(targetPrice));
      return sendResponse(res, 201, 'Negotiation initialized successfully.', negotiation);
    } catch (error) {
      next(error);
    }
  }

  public static async sendNegotiationMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const senderId = req.user!.id;
      const { id } = req.params;
      const { content, fileUrl } = req.body;
      if (!content) {
        throw new BadRequestError('Message content is required.');
      }
      const message = await AgriService.sendNegotiationMessage(id, senderId, content, fileUrl);
      return sendResponse(res, 201, 'Negotiation message sent successfully.', message);
    } catch (error) {
      next(error);
    }
  }

  public static async updateNegotiationStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { status } = req.body; // "ACCEPTED" or "REJECTED"
      if (!status || !['ACCEPTED', 'REJECTED'].includes(status)) {
        throw new BadRequestError('Invalid negotiation status. Must be ACCEPTED or REJECTED.');
      }
      const updated = await AgriService.updateNegotiationStatus(id, userId, status);
      return sendResponse(res, 200, `Negotiation ${status.toLowerCase()} successfully.`, updated);
    } catch (error) {
      next(error);
    }
  }

  public static async getNegotiationHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const history = await AgriService.getNegotiationHistory(id, userId);
      return sendResponse(res, 200, 'Negotiation history retrieved successfully.', history);
    } catch (error) {
      next(error);
    }
  }

  public static async getNegotiations(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      const negotiations = await AgriService.getNegotiations(userId, role);
      return sendResponse(res, 200, 'Negotiations list retrieved successfully.', negotiations);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Digital Contract Generation
   */
  public static async getContract(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { orderId } = req.params;
      const contract = await AgriService.getContract(orderId, userId);
      return sendResponse(res, 200, 'Digital contract retrieved successfully.', contract);
    } catch (error) {
      next(error);
    }
  }

  public static async generateContract(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { orderId } = req.params;
      const contract = await AgriService.generateContract(orderId, userId);
      return sendResponse(res, 201, 'Digital contract generated successfully.', contract);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Trust Score System
   */
  public static async getUserTrustScore(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.params.userId || req.user!.id;
      const trustScore = await AgriService.calculateTrustScore(userId);
      return sendResponse(res, 200, 'Trust score retrieved successfully.', { userId, trustScore });
    } catch (error) {
      next(error);
    }
  }
}
