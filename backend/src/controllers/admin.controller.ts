import { Request, Response, NextFunction } from 'express';
import prisma from '@/config/db';
import { AuditLogger } from '@/utils/auditLogger';
import { Role, Prisma } from '@prisma/client';
import { BadRequestError } from '@/utils/apiErrors';

export class AdminController {
  /**
   * List users with pagination and filtering
   */
  public static async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 10, role } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const filter: Prisma.UserWhereInput = {};
      if (role) {
        filter.role = role as Role;
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: filter,
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            profile: true,
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.user.count({ where: filter }),
      ]);

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle / update user role
   */
  public static async updateUserRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!Object.values(Role).includes(role)) {
        throw new BadRequestError('Invalid role value.');
      }

      const user = await prisma.user.update({
        where: { id },
        data: { role: role as Role },
      });

      await AuditLogger.log({
        userId: req.user!.id,
        action: 'UPDATE_USER_ROLE',
        details: `Updated role of user ${id} to ${role}`,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'User role updated successfully.',
        data: { id: user.id, email: user.email, role: user.role },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a user
   */
  public static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      
      await prisma.user.delete({
        where: { id },
      });

      await AuditLogger.log({
        userId: req.user!.id,
        action: 'DELETE_USER',
        details: `Deleted user ${id}`,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'User deleted successfully from exchange.',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update verification grade status of a product (Standard/Premium/Gold Verified)
   */
  public static async verifyProductGrade(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { verificationStatus } = req.body; // e.g. "Standard", "Premium Verified"

      const product = await prisma.product.update({
        where: { id },
        data: { sellerVerification: verificationStatus },
      });

      await AuditLogger.log({
        userId: req.user!.id,
        action: 'VERIFY_PRODUCT_GRADE',
        details: `Set product ${id} verification to ${verificationStatus}`,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Product verification grade updated.',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel/Terminate an active Live Auction
   */
  public static async cancelAuction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const auction = await prisma.auction.update({
        where: { id },
        data: { status: 'CANCELLED' },
      });

      await AuditLogger.log({
        userId: req.user!.id,
        action: 'CANCEL_AUCTION_ADMIN',
        details: `Cancelled auction ${id}`,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Auction cancelled successfully.',
        data: auction,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get recent security audit logs
   */
  public static async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (Number(page) - 1) * Number(limit);

      const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
          include: {
            user: {
              select: {
                email: true,
                role: true,
              },
            },
          },
          skip,
          take: Number(limit),
          orderBy: { createdAt: 'desc' },
        }),
        prisma.auditLog.count(),
      ]);

      res.status(200).json({
        success: true,
        data: {
          logs,
          pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit)),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
