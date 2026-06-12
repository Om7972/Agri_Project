import prisma from '@/config/db';
import { logger } from '@/utils/logger';

export class AnalyticsService {
  /**
   * Get Market Intelligence metrics: demand analysis, supply analysis and price trends
   */
  public static async getMarketIntelligence() {
    try {
      // 1. Demand Analysis: Sourced order item volumes by category
      const demandByCrop = await prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: {
          quantity: true,
        },
      });

      // Load products details to map names
      const products = await prisma.product.findMany({
        select: { id: true, title: true, cropType: true },
      });

      const demandAnalysis = demandByCrop.map((item) => {
        const prod = products.find((p) => p.id === item.productId);
        return {
          crop: prod ? prod.cropType : 'Unknown',
          title: prod ? prod.title : 'Unknown Product',
          totalQuantitySourced: item._sum.quantity || 0,
        };
      });

      // 2. Supply Analysis: Available stock levels by crop types
      const supplyByCrop = await prisma.product.groupBy({
        by: ['cropType'],
        where: { status: 'ACTIVE' },
        _sum: {
          stock: true,
        },
        _avg: {
          price: true,
        },
      });

      const supplyAnalysis = supplyByCrop.map((item) => ({
        crop: item.cropType,
        totalStockAvailable: item._sum.stock || 0,
        averagePrice: item._avg.price || 0,
      }));

      // 3. Price Trends: Live Rates indices history
      const priceTrends = await prisma.marketRate.findMany({
        select: {
          crop: true,
          priceIndia: true,
          priceDubai: true,
          changeIndia: true,
          changeDubai: true,
          unitIndia: true,
          unitDubai: true,
          sparkline: true,
        },
      });

      return {
        demandAnalysis,
        supplyAnalysis,
        priceTrends,
      };
    } catch (error) {
      logger.error('Error in AnalyticsService.getMarketIntelligence:', error);
      throw error;
    }
  }

  /**
   * Admin Platform Dashboard Overview Metrics
   */
  public static async getAdminOverview() {
    try {
      // Total Revenue from completed Orders
      const orderRevenue = await prisma.order.aggregate({
        where: { paymentStatus: 'RELEASED' },
        _sum: {
          totalAmount: true,
        },
      });

      // Total Revenue from Subscription transactions
      const subscriptionRevenue = await prisma.transaction.aggregate({
        where: { status: 'SUCCESS', subscriptionId: { not: null } },
        _sum: {
          amount: true,
        },
      });

      const totalRevenue = (orderRevenue._sum.totalAmount || 0) + (subscriptionRevenue._sum.amount || 0);

      // Counts
      const totalUsers = await prisma.user.count();
      const totalProducts = await prisma.product.count({ where: { status: 'ACTIVE' } });
      const totalOrders = await prisma.order.count();
      const activeAuctions = await prisma.auction.count({ where: { status: 'ACTIVE' } });

      // Role distribution
      const usersByRole = await prisma.user.groupBy({
        by: ['role'],
        _count: {
          id: true,
        },
      });

      // Month-on-month Order Growth
      const pastMonth = new Date();
      pastMonth.setDate(pastMonth.getDate() - 30);
      const recentOrdersCount = await prisma.order.count({
        where: { createdAt: { gte: pastMonth } },
      });

      // Recent Transactions
      const recentTransactions = await prisma.transaction.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              email: true,
              profile: { select: { fullName: true } },
            },
          },
        },
      });

      return {
        metrics: {
          totalRevenue,
          totalUsers,
          totalProducts,
          totalOrders,
          activeAuctions,
          ordersGrowthLast30Days: recentOrdersCount,
        },
        usersByRole: usersByRole.map((roleInfo) => ({
          role: roleInfo.role,
          count: roleInfo._count.id,
        })),
        recentTransactions,
      };
    } catch (error) {
      logger.error('Error in AnalyticsService.getAdminOverview:', error);
      throw error;
    }
  }
}
