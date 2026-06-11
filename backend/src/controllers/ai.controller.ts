import { Request, Response, NextFunction } from 'express';
import { AiService } from '@/services/ai.service';
import { sendResponse } from '@/utils/responseHandlers';
import { BadRequestError } from '@/utils/apiErrors';

export class AiController {
  public static async predict(req: Request, res: Response, next: NextFunction) {
    try {
      const { crop, quantity, location } = req.body;
      const prediction = await AiService.predictPrice(crop, quantity, location);
      return sendResponse(res, 200, 'Price prediction computed successfully.', prediction);
    } catch (error) {
      next(error);
    }
  }

  public static async match(req: Request, res: Response, next: NextFunction) {
    try {
      const buyerId = req.query.buyerId as string;
      const sellerId = req.query.sellerId as string;

      if (!buyerId || !sellerId) {
        throw new BadRequestError('Both buyerId and sellerId query parameters are required.');
      }

      const matchResult = await AiService.calculateMatchScore(buyerId, sellerId);
      return sendResponse(res, 200, 'Match score calculated successfully.', matchResult);
    } catch (error) {
      next(error);
    }
  }

  public static async recommend(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const recommendations = await AiService.getRecommendations(userId, userRole);
      return sendResponse(res, 200, 'Recommendations retrieved successfully.', recommendations);
    } catch (error) {
      next(error);
    }
  }

  public static async getIntelligence(req: Request, res: Response, next: NextFunction) {
    try {
      const intelligence = await AiService.getMarketIntelligence();
      return sendResponse(res, 200, 'Market intelligence data retrieved successfully.', intelligence);
    } catch (error) {
      next(error);
    }
  }

  public static async createChatSession(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { title } = req.body;
      const session = await AiService.createChatSession(userId, title);
      return sendResponse(res, 201, 'Chat session initiated successfully.', session);
    } catch (error) {
      next(error);
    }
  }

  public static async getChatSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const sessions = await AiService.getChatSessions(userId);
      return sendResponse(res, 200, 'Chat sessions retrieved successfully.', sessions);
    } catch (error) {
      next(error);
    }
  }

  public static async getChatMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const messages = await AiService.getChatMessages(id, userId);
      return sendResponse(res, 200, 'Chat history retrieved successfully.', messages);
    } catch (error) {
      next(error);
    }
  }

  public static async sendChatMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const { message } = req.body;

      if (!message) {
        throw new BadRequestError('Message body content is required.');
      }

      const result = await AiService.sendMessage(id, userId, message);
      return sendResponse(res, 200, 'Message processed successfully.', result);
    } catch (error) {
      next(error);
    }
  }
}
