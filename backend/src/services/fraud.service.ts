import prisma from '@/config/db';

interface FraudSignal {
  alertType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: string;
}

export class FraudService {
  /**
   * Run all fraud detection checks for a given user and persist alerts.
   */
  public static async analyzeUser(userId: string) {
    const signals: FraudSignal[] = [];

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        products: { include: { qualityGrading: true } },
        reviewsReceived: true,
        reviewsGiven: true,
        bids: { orderBy: { createdAt: 'desc' }, take: 20 },
        ordersAsBuyer: { select: { totalAmount: true, status: true, createdAt: true } },
      },
    });

    if (!user) return { userId, signals: [], riskScore: 0, riskLevel: 'CLEAN' };

    // ---- 1. Suspicious Pricing Check ----
    for (const product of user.products) {
      const marketRate = await prisma.marketRate.findFirst({
        where: { crop: { equals: product.cropType, mode: 'insensitive' } },
      });
      if (marketRate) {
        const deviation = Math.abs((product.price - marketRate.priceIndia) / marketRate.priceIndia);
        if (deviation > 0.5) {
          signals.push({
            alertType: 'SUSPICIOUS_PRICING',
            severity: deviation > 0.8 ? 'HIGH' : 'MEDIUM',
            details: `Product "${product.title}" priced at ₹${product.price} vs market rate ₹${marketRate.priceIndia} (${(deviation * 100).toFixed(1)}% deviation)`,
          });
        }
      }
    }

    // ---- 2. Account Age vs Activity Check ----
    const accountAgeDays = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const highValueBids = user.bids.filter((b) => b.bidAmount > 100000);
    if (accountAgeDays < 7 && highValueBids.length > 3) {
      signals.push({
        alertType: 'ABNORMAL_ACTIVITY',
        severity: 'HIGH',
        details: `New account (${Math.floor(accountAgeDays)} days old) placed ${highValueBids.length} high-value bids >₹1L within first week`,
      });
    }

    // ---- 3. Trust Score Check ----
    if (user.trustScore < 40) {
      signals.push({
        alertType: 'FAKE_SELLER',
        severity: user.trustScore < 20 ? 'CRITICAL' : 'HIGH',
        details: `Trust score critically low: ${user.trustScore}/100. Possible fraudulent activity pattern detected.`,
      });
    }

    // ---- 4. Review Manipulation Check ----
    if (user.reviewsGiven.length > 0) {
      const selfReviews = user.reviewsGiven.filter((r) => r.revieweeId === userId);
      if (selfReviews.length > 0) {
        signals.push({
          alertType: 'REVIEW_MANIPULATION',
          severity: 'HIGH',
          details: `User submitted ${selfReviews.length} self-review(s). Possible rating manipulation.`,
        });
      }

      // Bulk identical reviews
      const ratings = user.reviewsGiven.map((r) => r.rating);
      const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      if (ratings.length >= 5 && avgRating === 5 && ratings.every((r) => r === 5)) {
        signals.push({
          alertType: 'REVIEW_MANIPULATION',
          severity: 'MEDIUM',
          details: `User gave ${ratings.length} consecutive 5-star reviews — possible coordinated rating inflation.`,
        });
      }
    }

    // ---- 5. Order Cancellation Pattern ----
    const cancelledOrders = user.ordersAsBuyer.filter((o) => o.status === 'CANCELLED');
    if (user.ordersAsBuyer.length > 0) {
      const cancelRate = cancelledOrders.length / user.ordersAsBuyer.length;
      if (cancelRate > 0.5 && user.ordersAsBuyer.length >= 5) {
        signals.push({
          alertType: 'ABNORMAL_ACTIVITY',
          severity: 'MEDIUM',
          details: `High order cancellation rate: ${(cancelRate * 100).toFixed(0)}% (${cancelledOrders.length}/${user.ordersAsBuyer.length} orders cancelled)`,
        });
      }
    }

    // ---- Compute Risk Score ----
    const severityWeight = { LOW: 10, MEDIUM: 20, HIGH: 35, CRITICAL: 50 };
    const riskScore = Math.min(
      100,
      signals.reduce((acc, s) => acc + severityWeight[s.severity], 0),
    );
    const riskLevel =
      riskScore >= 70 ? 'CRITICAL' : riskScore >= 50 ? 'HIGH' : riskScore >= 25 ? 'MEDIUM' : 'CLEAN';

    // Persist alerts to DB
    for (const signal of signals) {
      await prisma.fraudAlert.upsert({
        where: {
          // No unique constraint, use create always
          id: 'new',
        },
        update: {},
        create: {
          userId,
          alertType: signal.alertType,
          severity: signal.severity,
          details: signal.details,
        },
      }).catch(async () => {
        // Fallback: just create
        await prisma.fraudAlert.create({
          data: {
            userId,
            alertType: signal.alertType,
            severity: signal.severity,
            details: signal.details,
          },
        });
      });
    }

    return {
      userId,
      userEmail: user.email,
      userRole: user.role,
      accountAgeDays: Math.floor(accountAgeDays),
      trustScore: user.trustScore,
      signals,
      riskScore,
      riskLevel,
    };
  }

  /**
   * Get all active (unresolved) fraud alerts — admin use.
   */
  public static async getActiveAlerts(limit = 50) {
    return prisma.fraudAlert.findMany({
      where: { isResolved: false },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Platform-wide anomaly scan: scan all users and return top risks.
   */
  public static async scanPlatform() {
    const users = await prisma.user.findMany({
      where: { trustScore: { lt: 60 } },
      select: { id: true },
      take: 100,
    });

    const results = await Promise.all(users.map((u) => this.analyzeUser(u.id)));
    return results
      .filter((r) => r.riskLevel !== 'CLEAN')
      .sort((a, b) => b.riskScore - a.riskScore);
  }

  /**
   * Resolve a fraud alert.
   */
  public static async resolveAlert(alertId: string, resolvedBy: string) {
    return prisma.fraudAlert.update({
      where: { id: alertId },
      data: { isResolved: true, resolvedBy },
    });
  }
}
