import prisma from '@/config/db';
import redisClient from '@/config/redis';

export class ReportsService {
  private static CACHE_TTL = { daily: 3600, weekly: 21600, monthly: 86400 };

  /**
   * Generate or retrieve a cached market report by type.
   */
  public static async getReport(type: 'daily' | 'weekly' | 'monthly') {
    const cacheKey = `report:${type}`;

    // Try Redis cache first
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch {
      // Redis unavailable — proceed to generate
    }

    const report = await this.generateReport(type);

    // Store in Redis
    try {
      await redisClient.setEx(cacheKey, this.CACHE_TTL[type], JSON.stringify(report));
    } catch { /* ignore */ }

    // Persist to DB for audit trail
    await prisma.marketReport.create({
      data: { type, data: report as any },
    });

    return report;
  }

  private static async generateReport(type: 'daily' | 'weekly' | 'monthly') {
    const now = new Date();
    const from = new Date(now);
    if (type === 'daily') from.setDate(now.getDate() - 1);
    else if (type === 'weekly') from.setDate(now.getDate() - 7);
    else from.setMonth(now.getMonth() - 1);

    // --- Core Metrics ---
    const [orders, auctionBids, newUsers, newProducts, marketRates] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: from } },
        select: { totalAmount: true, status: true, createdAt: true },
      }),
      prisma.bid.findMany({
        where: { createdAt: { gte: from } },
        select: { bidAmount: true, status: true },
      }),
      prisma.user.count({ where: { createdAt: { gte: from } } }),
      prisma.product.count({ where: { createdAt: { gte: from } } }),
      prisma.marketRate.findMany({
        select: { crop: true, priceIndia: true, priceDubai: true, changeIndia: true, changeDubai: true },
        take: 10,
      }),
    ]);

    const totalRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
    const completedOrders = orders.filter((o) => o.status === 'COMPLETED').length;
    const totalAuctionVolume = auctionBids.reduce((acc, b) => acc + b.bidAmount, 0);

    // Top commodities by active stock
    const topCommodities = await prisma.product.groupBy({
      by: ['cropType'],
      _sum: { stock: true, price: true },
      _count: { id: true },
      where: { status: 'ACTIVE' },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });

    // Revenue by period buckets
    const revenueTrend = this.buildTrendBuckets(orders, type);

    // Demand analysis
    const demandAnalysis = await prisma.demandForecast.findMany({
      orderBy: { demandScore: 'desc' },
      take: 8,
    });

    // Subscription breakdown
    const subscriptions = await prisma.subscription.groupBy({
      by: ['tier'],
      _count: { id: true },
      where: { status: 'ACTIVE' },
    });

    return {
      type,
      generatedAt: now.toISOString(),
      period: { from: from.toISOString(), to: now.toISOString() },
      summary: {
        totalRevenue,
        totalOrders: orders.length,
        completedOrders,
        completionRate: orders.length > 0 ? ((completedOrders / orders.length) * 100).toFixed(1) : '0',
        newUsers,
        newProducts,
        totalAuctionVolume,
      },
      revenueTrend,
      topCommodities: topCommodities.map((c) => ({
        crop: c.cropType,
        listings: c._count.id,
        totalStock: c._sum.stock ?? 0,
        avgPrice: c._sum.price && c._count.id > 0 ? (c._sum.price / c._count.id).toFixed(2) : '0',
      })),
      marketRates: marketRates.map((r) => ({
        crop: r.crop,
        priceIndia: r.priceIndia,
        priceDubai: r.priceDubai,
        trendIndia: r.changeIndia > 0 ? 'UP' : r.changeIndia < 0 ? 'DOWN' : 'STABLE',
        trendDubai: r.changeDubai > 0 ? 'UP' : r.changeDubai < 0 ? 'DOWN' : 'STABLE',
      })),
      demandHighlights: demandAnalysis,
      subscriptionBreakdown: subscriptions,
    };
  }

  private static buildTrendBuckets(
    orders: { totalAmount: number; createdAt: Date }[],
    type: 'daily' | 'weekly' | 'monthly',
  ) {
    const buckets: Record<string, number> = {};
    const labelFn = (d: Date) => {
      if (type === 'daily') return `${d.getHours()}:00`;
      if (type === 'weekly') return d.toLocaleDateString('en-IN', { weekday: 'short' });
      return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
    };

    for (const order of orders) {
      const label = labelFn(new Date(order.createdAt));
      buckets[label] = (buckets[label] ?? 0) + order.totalAmount;
    }

    return Object.entries(buckets).map(([label, amount]) => ({ label, amount }));
  }
}
