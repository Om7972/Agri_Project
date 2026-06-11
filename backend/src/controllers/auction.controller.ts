import { Request, Response, NextFunction } from 'express';
import { AuctionService } from '@/services/auction.service';
import { sendResponse } from '@/utils/responseHandlers';

export class AuctionController {
  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const creatorId = req.user!.id;
      const auction = await AuctionService.createAuction(creatorId, req.body);
      return sendResponse(res, 201, 'Auction created successfully.', auction);
    } catch (error) {
      next(error);
    }
  }

  public static async placeBid(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const bidderId = req.user!.id;
      const { bidAmount } = req.body;

      const bid = await AuctionService.placeBid(id, bidderId, bidAmount);
      return sendResponse(res, 201, 'Bid placed successfully.', bid);
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const auction = await AuctionService.getAuctionById(id);
      return sendResponse(res, 200, 'Auction retrieved successfully.', auction);
    } catch (error) {
      next(error);
    }
  }

  public static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, cropType, page, limit } = req.query;

      const filters = {
        status: status as any,
        cropType: cropType as string,
        page: page ? parseInt(page as string, 10) : undefined,
        limit: limit ? parseInt(limit as string, 10) : undefined,
      };

      const result = await AuctionService.listAuctions(filters);
      return sendResponse(res, 200, 'Auctions retrieved successfully.', result.auctions, result.meta);
    } catch (error) {
      next(error);
    }
  }
}
