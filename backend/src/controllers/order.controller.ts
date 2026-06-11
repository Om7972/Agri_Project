import { Request, Response, NextFunction } from 'express';
import { OrderService } from '@/services/order.service';
import { sendResponse } from '@/utils/responseHandlers';

export class OrderController {
  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const buyerId = req.user!.id;
      const { productId, quantity } = req.body;

      const order = await OrderService.createOrder(buyerId, productId, quantity);
      return sendResponse(res, 201, 'Order created and escrow offer sent.', order);
    } catch (error) {
      next(error);
    }
  }

  public static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const { status, paymentStatus } = req.body;

      const order = await OrderService.updateOrderStatus(id, userId, userRole, status, paymentStatus);
      return sendResponse(res, 200, 'Order status updated successfully.', order);
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user!.id;
      const userRole = req.user!.role;

      const order = await OrderService.getOrderById(id, userId, userRole);
      return sendResponse(res, 200, 'Order retrieved successfully.', order);
    } catch (error) {
      next(error);
    }
  }

  public static async listMyOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const userRole = req.user!.role;
      const { page, limit } = req.query;

      const pageNum = page ? parseInt(page as string, 10) : 1;
      const limitNum = limit ? parseInt(limit as string, 10) : 10;

      const result = await OrderService.listUserOrders(userId, userRole, pageNum, limitNum);
      return sendResponse(res, 200, 'Orders retrieved successfully.', result.orders, result.meta);
    } catch (error) {
      next(error);
    }
  }
}
