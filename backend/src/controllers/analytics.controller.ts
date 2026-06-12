import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '@/services/analytics.service';

export class AnalyticsController {
  /**
   * Get crop price trends, supply, and demand insights
   */
  public static async getMarketIntelligence(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AnalyticsService.getMarketIntelligence();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get Admin dashboard metrics, user breakdown, and recent logs
   */
  public static async getAdminOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await AnalyticsService.getAdminOverview();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
