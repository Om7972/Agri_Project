import prisma from '@/config/db';
import { NotFoundError } from '@/utils/apiErrors';

export class AiService {
  /**
   * Feature 1: AI Crop Price Prediction
   */
  public static async predictPrice(crop: string, quantity: number, location: string) {
    // Check if we have any seed price for this crop
    const dbRate = await prisma.marketRate.findFirst({
      where: { crop: { equals: crop, mode: 'insensitive' } },
    });

    // Determine baseline unit price
    let basePrice = 2500; // Default fallback price per unit
    let bestMarket = 'Mumbai BKC Trade Hub';
    let trend = 'STABLE';
    let confidenceScore = 0.88;

    if (dbRate) {
      if (location.toLowerCase().includes('dubai') || location.toLowerCase().includes('uae')) {
        basePrice = dbRate.priceDubai;
        bestMarket = dbRate.locationDubai;
        trend = dbRate.changeDubai > 0 ? 'UP' : dbRate.changeDubai < 0 ? 'DOWN' : 'STABLE';
      } else {
        basePrice = dbRate.priceIndia;
        bestMarket = dbRate.locationIndia;
        trend = dbRate.changeIndia > 0 ? 'UP' : dbRate.changeIndia < 0 ? 'DOWN' : 'STABLE';
      }
    }

    // Advanced mathematical adjustments based on quantity and location
    // Large bulk quantities get a slight bulk discount on unit prices
    const bulkCoefficient = quantity > 100 ? 0.95 : quantity > 50 ? 0.98 : 1.0;
    const expectedUnitPrice = basePrice * bulkCoefficient;
    const expectedPrice = expectedUnitPrice * quantity;

    // Confidence adjustments based on data availability
    confidenceScore = dbRate ? 0.92 : 0.78;
    if (quantity > 500) {
      // High volume predictions have wider margins
      confidenceScore -= 0.05;
    }

    // Save prediction query history
    await prisma.pricePrediction.create({
      data: {
        crop,
        quantity,
        location,
        expectedPrice,
        bestMarket,
        confidenceScore,
        trend,
      },
    });

    return {
      crop,
      quantity,
      location,
      expectedUnitPrice,
      expectedTotalPrice: expectedPrice,
      bestMarket,
      confidenceScore,
      trend,
    };
  }

  /**
   * Feature 2: Buyer Seller Matching
   */
  public static async calculateMatchScore(buyerId: string, sellerId: string) {
    const buyer = await prisma.user.findUnique({
      where: { id: buyerId },
      include: { profile: true, ordersAsBuyer: { include: { items: { include: { product: true } } } } },
    });

    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      include: { profile: true, products: true, reviewsReceived: true },
    });

    if (!buyer || !seller) {
      throw new NotFoundError('One or both users not found.');
    }

    let score = 50; // Base score
    const reasons: string[] = ['Baseline trade alignment'];

    // 1. Proximity matching
    if (buyer.profile?.country && seller.profile?.country && buyer.profile.country === seller.profile.country) {
      score += 20;
      reasons.push('Same country proximity (+20)');
      if (buyer.profile?.city && seller.profile?.city && buyer.profile.city === seller.profile.city) {
        score += 15;
        reasons.push('Same city proximity (+15)');
      }
    } else {
      score -= 10;
      reasons.push('International shipping requirements (-10)');
    }

    // 2. Seller Verification match
    const isElite = seller.products.some((p) => p.sellerVerification === 'Elite');
    if (isElite) {
      score += 15;
      reasons.push('Elite seller status verified (+15)');
    }

    // 3. Historical reviews rating
    if (seller.reviewsReceived.length > 0) {
      const avgRating = seller.reviewsReceived.reduce((acc, r) => acc + r.rating, 0) / seller.reviewsReceived.length;
      if (avgRating >= 4.5) {
        score += 10;
        reasons.push('Highly rated seller (>4.5 stars) (+10)');
      } else if (avgRating < 3.0) {
        score -= 15;
        reasons.push('Seller ratings below standard (-15)');
      }
    }

    // 4. Crop interest match
    const buyerCrops = new Set(buyer.ordersAsBuyer.flatMap((o) => o.items.map((i) => i.product.cropType.toLowerCase())));
    const sellerCrops = new Set(seller.products.map((p) => p.cropType.toLowerCase()));
    
    const overlap = [...buyerCrops].filter((x) => sellerCrops.has(x));
    if (overlap.length > 0) {
      score += 15;
      reasons.push(`Buyer previously purchased matching crops (${overlap.join(', ')}) (+15)`);
    }

    // Normalizing between 0 and 100
    const finalScore = Math.min(100, Math.max(0, score));

    return {
      buyerId,
      sellerId,
      matchScore: finalScore,
      matchGrade: finalScore >= 85 ? 'EXCELLENT' : finalScore >= 70 ? 'GOOD' : 'FAIR',
      reasons,
    };
  }

  /**
   * Feature 3: Recommendation Engine
   */
  public static async getRecommendations(userId: string, role: string) {
    // Recommendation algorithm:
    // If Buyer/Exporter: Suggest Best Sellers (Highly Rated, Verified) and Best Products (Active, High Stock)
    // If Farmer: Suggest Best Buyers (high volume of completed orders)
    
    if (role === 'BUYER' || role === 'EXPORTER' || role === 'ADMIN') {
      const bestSellers = await prisma.user.findMany({
        where: { role: 'FARMER' },
        take: 3,
        select: {
          id: true,
          email: true,
          profile: true,
          products: {
            where: { status: 'ACTIVE' },
            select: { title: true, price: true },
          },
        },
      });

      const bestProducts = await prisma.product.findMany({
        where: { status: 'ACTIVE' },
        orderBy: [
          { sellerVerification: 'desc' },
          { stock: 'desc' },
        ],
        take: 5,
        include: {
          seller: { select: { profile: { select: { fullName: true } } } },
        },
      });

      return {
        bestSellers,
        bestProducts,
      };
    } else {
      // Farmer recommendations
      const bestBuyers = await prisma.user.findMany({
        where: { role: { in: ['BUYER', 'EXPORTER'] } },
        take: 3,
        select: {
          id: true,
          email: true,
          profile: true,
          ordersAsBuyer: {
            take: 2,
            orderBy: { createdAt: 'desc' },
            select: { totalAmount: true, status: true },
          },
        },
      });

      return {
        bestBuyers,
      };
    }
  }


  /**
   * Feature 4: Market Intelligence Dashboard
   */
  public static async getMarketIntelligence() {
    // 1. Supply Analysis: Group active stocks by cropType
    const rawSupply = await prisma.product.groupBy({
      by: ['cropType'],
      _sum: { stock: true },
      _count: { id: true },
      where: { status: 'ACTIVE' },
    });

    const supplyAnalysis = rawSupply.map((item) => ({
      crop: item.cropType,
      activeListings: item._count.id,
      totalVolumeAvailable: item._sum.stock || 0,
    }));

    // 2. Demand Analysis: Group orders and order quantities by cropType
    const rawDemand = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
    });

    // Populate crop names for product IDs
    const demandAnalysis = [];
    for (const item of rawDemand) {
      const prod = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { cropType: true },
      });
      if (prod) {
        demandAnalysis.push({
          crop: prod.cropType,
          totalUnitsDemanded: item._sum.quantity || 0,
        });
      }
    }

    // 3. Price Trends: Get average list prices per crop
    const rawTrends = await prisma.product.groupBy({
      by: ['cropType'],
      _avg: { price: true },
      _min: { price: true },
      _max: { price: true },
      where: { status: 'ACTIVE' },
    });

    const priceTrends = rawTrends.map((item) => ({
      crop: item.cropType,
      averagePrice: item._avg.price || 0,
      minPrice: item._min.price || 0,
      maxPrice: item._max.price || 0,
    }));

    return {
      supplyAnalysis,
      demandAnalysis,
      priceTrends,
      timestamp: new Date(),
    };
  }

  /**
   * Feature 6: AI Crop Advisor
   * Answers: What to plant, which crop has highest demand, best market
   */
  public static async getCropAdvisor(query: string, location?: string) {
    const q = query.toLowerCase();

    // Load market data
    const [marketRates, demandForecasts, supplyData] = await Promise.all([
      prisma.marketRate.findMany({ orderBy: { updatedAt: 'desc' } }),
      prisma.demandForecast.findMany({ orderBy: { demandScore: 'desc' } }),
      prisma.product.groupBy({
        by: ['cropType'],
        _sum: { stock: true },
        _count: { id: true },
        where: { status: 'ACTIVE' },
      }),
    ]);

    // Score each crop
    const cropScores: Record<string, { demand: number; supply: number; price: number; market: string; trend: string }> = {};

    for (const rate of marketRates) {
      const isUAE = location?.toLowerCase().includes('uae') || location?.toLowerCase().includes('dubai');
      cropScores[rate.crop] = {
        demand: 0,
        supply: 0,
        price: isUAE ? rate.priceDubai : rate.priceIndia,
        market: isUAE ? rate.locationDubai : rate.locationIndia,
        trend: (isUAE ? rate.changeDubai : rate.changeIndia) > 0 ? 'UP' : 'STABLE',
      };
    }

    for (const forecast of demandForecasts) {
      if (cropScores[forecast.cropType]) {
        cropScores[forecast.cropType].demand = forecast.demandScore;
      }
    }

    for (const supply of supplyData) {
      if (cropScores[supply.cropType]) {
        cropScores[supply.cropType].supply = supply._sum.stock ?? 0;
      }
    }

    // Rank crops by demand-supply gap (high demand, low supply = best opportunity)
    const ranked = Object.entries(cropScores)
      .map(([crop, data]) => ({
        crop,
        recommendationScore: data.demand - data.supply * 0.01,
        demandScore: data.demand,
        currentPrice: data.price,
        bestMarket: data.market,
        trend: data.trend,
      }))
      .sort((a, b) => b.recommendationScore - a.recommendationScore);

    let type: 'WHAT_TO_PLANT' | 'HIGHEST_DEMAND' | 'BEST_MARKET' = 'WHAT_TO_PLANT';
    if (q.includes('demand') || q.includes('sell')) type = 'HIGHEST_DEMAND';
    if (q.includes('market') || q.includes('where') || q.includes('mandi')) type = 'BEST_MARKET';

    const top3 = ranked.slice(0, 3);
    const primary = top3[0];

    const advice: Record<typeof type, string> = {
      WHAT_TO_PLANT: `Based on current market analysis, **${primary?.crop ?? 'Wheat'}** has the highest demand-supply gap. With demand score of ${primary?.demandScore?.toFixed(0) ?? 75}/100 and current price ₹${primary?.currentPrice?.toFixed(0) ?? '2450'}, it offers the best planting opportunity right now.`,
      HIGHEST_DEMAND: `Top crops by market demand: (1) ${top3[0]?.crop} — ${top3[0]?.demandScore?.toFixed(0)}/100, (2) ${top3[1]?.crop ?? 'Rice'} — ${(top3[1]?.demandScore ?? 70).toFixed(0)}/100, (3) ${top3[2]?.crop ?? 'Cotton'} — ${(top3[2]?.demandScore ?? 65).toFixed(0)}/100. These crops have the highest active buyer interest.`,
      BEST_MARKET: `The best market for your produce right now is **${primary?.bestMarket ?? 'Mumbai BKC Trade Hub'}**. ${primary?.crop} is commanding ₹${primary?.currentPrice?.toFixed(0) ?? '2450'} per unit with a ${primary?.trend} trend.`,
    };

    return {
      queryType: type,
      advice: advice[type],
      topRecommendations: top3,
      confidence: top3.length > 0 ? 0.88 : 0.60,
      timestamp: new Date(),
    };
  }

  /**
   * Feature 7: AI Price Forecasting (7/30/90 day)
   */
  public static async getPriceForecast(crop: string, horizon: 7 | 30 | 90) {
    const marketRate = await prisma.marketRate.findFirst({
      where: { crop: { equals: crop, mode: 'insensitive' } },
    });

    const demandForecast = await prisma.demandForecast.findFirst({
      where: { cropType: { equals: crop, mode: 'insensitive' } },
    });

    const basePrice = marketRate?.priceIndia ?? 2500;
    const baseChange = marketRate?.changeIndia ?? 0;
    const demandScore = demandForecast?.demandScore ?? 50;
    const sparkline = (marketRate?.sparkline as number[]) ?? [0, 1, -1, 2, 0, 3];

    // Calculate momentum from sparkline
    const momentum = sparkline.length > 1
      ? (sparkline[sparkline.length - 1] - sparkline[0]) / sparkline.length
      : 0;

    // Project price over horizon
    const dailyGrowthRate = (baseChange / 100 / 30) + (demandScore > 60 ? 0.001 : -0.0005) + momentum * 0.0001;
    const projectedPrice = basePrice * Math.pow(1 + dailyGrowthRate, horizon);
    const priceChange = projectedPrice - basePrice;
    const priceChangePct = (priceChange / basePrice) * 100;

    // Confidence: shorter horizon = higher confidence
    const baseConfidence = horizon === 7 ? 0.92 : horizon === 30 ? 0.78 : 0.64;
    const confidence = marketRate ? baseConfidence : baseConfidence - 0.12;

    // Build day-by-day projection points (sample at key intervals)
    const intervals = horizon === 7 ? 7 : horizon === 30 ? 6 : 9;
    const step = horizon / intervals;
    const projectionPoints = Array.from({ length: intervals + 1 }, (_, i) => {
      const day = Math.round(i * step);
      const price = basePrice * Math.pow(1 + dailyGrowthRate, day);
      return { day, price: parseFloat(price.toFixed(2)) };
    });

    const trend = priceChangePct > 2 ? 'BULLISH' : priceChangePct < -2 ? 'BEARISH' : 'NEUTRAL';

    return {
      crop,
      horizon,
      currentPrice: basePrice,
      projectedPrice: parseFloat(projectedPrice.toFixed(2)),
      priceChange: parseFloat(priceChange.toFixed(2)),
      priceChangePct: parseFloat(priceChangePct.toFixed(2)),
      trend,
      confidence,
      projectionPoints,
      bestMarket: marketRate?.locationIndia ?? 'Mumbai BKC',
      demandLevel: demandForecast?.demandLevel ?? 'MEDIUM',
      generatedAt: new Date(),
    };
  }

  /**
   * Feature 8: Export Readiness Checker
   */
  public static async getExportReadiness(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        qualityGrading: true,
        seller: { include: { profile: true } },
      },
    });

    if (!product) throw new NotFoundError('Product not found.');

    // Check shipment documents linked to orders for this product
    const orderItems = await prisma.orderItem.findMany({
      where: { productId },
      include: { order: { include: { shipment: { include: { documents: true } } } } },
    });

    const allDocs = orderItems.flatMap((oi) => oi.order.shipment?.documents ?? []);
    const docTypes = new Set(allDocs.map((d) => d.documentType));

    // --- Quality Check ---
    const qualityScore = product.qualityGrading
      ? { score: product.qualityGrading.grade === 'PREMIUM' ? 100 : product.qualityGrading.grade === 'GRADE_A' ? 85 : 60, status: 'PASS' as const, details: `Grade: ${product.qualityGrading.grade}` }
      : product.grade === 'A' || product.grade === 'Premium'
      ? { score: 80, status: 'PASS' as const, details: `Self-declared grade: ${product.grade}` }
      : { score: 40, status: 'WARN' as const, details: 'No third-party quality grading on file. Lab report recommended.' };

    // --- Packaging Check ---
    const packagingScore =
      product.sellerVerification === 'Elite' ? { score: 95, status: 'PASS' as const, details: 'Elite seller — packaging standards verified' }
      : product.sellerVerification === 'Verified' ? { score: 75, status: 'PASS' as const, details: 'Verified seller packaging' }
      : { score: 45, status: 'WARN' as const, details: 'Standard packaging. APEDA export packaging guidelines recommended.' };

    // --- Documentation Check ---
    const requiredDocs = ['PHYTOSANITARY', 'CERTIFICATE_OF_ORIGIN', 'COMMERCIAL_INVOICE'];
    const missingDocs = requiredDocs.filter((d) => !docTypes.has(d as string));
    const docScore =
      missingDocs.length === 0 ? { score: 100, status: 'PASS' as const, details: 'All required export documents present' }
      : missingDocs.length <= 1 ? { score: 65, status: 'WARN' as const, details: `Missing: ${missingDocs.join(', ')}` }
      : { score: 20, status: 'FAIL' as const, details: `Missing critical docs: ${missingDocs.join(', ')}` };

    const overallScore = Math.round((qualityScore.score + packagingScore.score + docScore.score) / 3);
    const readinessLevel =
      overallScore >= 80 ? 'EXPORT_READY' : overallScore >= 60 ? 'NEARLY_READY' : 'NOT_READY';

    return {
      productId,
      productTitle: product.title,
      cropType: product.cropType,
      overallScore,
      readinessLevel,
      checks: {
        quality: qualityScore,
        packaging: packagingScore,
        documentation: docScore,
      },
      recommendations:
        readinessLevel === 'EXPORT_READY'
          ? ['Product meets UAE/International export standards. You can list on the Export Portal.']
          : [
              qualityScore.status !== 'PASS' ? 'Get lab quality certification from APEDA or accredited lab' : null,
              packagingScore.status !== 'PASS' ? 'Upgrade packaging to APEDA/BIS export standards' : null,
              docScore.status !== 'PASS' ? `Submit missing documents: ${missingDocs.join(', ')}` : null,
            ].filter(Boolean),
    };
  }

  /**
   * Feature 9: Commodity Heatmap Data
   * Returns regional supply/demand/pricing keyed by region
   */
  public static async getHeatmapData() {
    const [marketRates, products, demandForecasts] = await Promise.all([
      prisma.marketRate.findMany(),
      prisma.product.findMany({ where: { status: 'ACTIVE' }, select: { cropType: true, stock: true, price: true } }),
      prisma.demandForecast.findMany(),
    ]);

    // India regions (static geographical mapping)
    const indiaRegions = [
      { id: 'punjab', name: 'Punjab', lat: 31.1, lng: 75.3, crops: ['Wheat', 'Rice', 'Cotton'] },
      { id: 'maharashtra', name: 'Maharashtra', lat: 19.7, lng: 75.7, crops: ['Sugarcane', 'Cotton', 'Soybean'] },
      { id: 'andhra', name: 'Andhra Pradesh', lat: 15.9, lng: 79.7, crops: ['Rice', 'Chilli', 'Tobacco'] },
      { id: 'gujarat', name: 'Gujarat', lat: 22.3, lng: 71.2, crops: ['Cotton', 'Groundnut', 'Castor'] },
      { id: 'rajasthan', name: 'Rajasthan', lat: 27.0, lng: 74.2, crops: ['Wheat', 'Mustard', 'Bajra'] },
      { id: 'karnataka', name: 'Karnataka', lat: 15.3, lng: 75.7, crops: ['Coffee', 'Sugarcane', 'Rice'] },
      { id: 'up', name: 'Uttar Pradesh', lat: 26.8, lng: 80.9, crops: ['Wheat', 'Sugarcane', 'Potato'] },
      { id: 'mp', name: 'Madhya Pradesh', lat: 22.9, lng: 78.7, crops: ['Soybean', 'Wheat', 'Cotton'] },
    ];

    // UAE regions
    const uaeRegions = [
      { id: 'dubai', name: 'Dubai', lat: 25.2, lng: 55.3, crops: ['Wheat', 'Rice', 'Dates'] },
      { id: 'abudhabi', name: 'Abu Dhabi', lat: 24.5, lng: 54.4, crops: ['Dates', 'Rice', 'Vegetables'] },
      { id: 'sharjah', name: 'Sharjah', lat: 25.3, lng: 55.4, crops: ['Vegetables', 'Wheat', 'Cotton'] },
    ];

    const buildRegionData = (regions: typeof indiaRegions, isUAE = false) =>
      regions.map((region) => {
        const regionalRates = marketRates.filter((r) => region.crops.includes(r.crop));
        const avgPrice = regionalRates.length > 0
          ? regionalRates.reduce((acc, r) => acc + (isUAE ? r.priceDubai : r.priceIndia), 0) / regionalRates.length
          : 2000;

        const supply = products
          .filter((p) => region.crops.some((c) => p.cropType.toLowerCase().includes(c.toLowerCase())))
          .reduce((acc, p) => acc + p.stock, 0);

        const demand = demandForecasts
          .filter((d) => region.crops.some((c) => d.cropType.toLowerCase().includes(c.toLowerCase())))
          .reduce((acc, d) => acc + d.demandScore, 0);

        return {
          id: region.id,
          name: region.name,
          lat: region.lat,
          lng: region.lng,
          topCrops: region.crops,
          metrics: {
            supply: Math.round(supply),
            demand: Math.round(demand),
            avgPrice: Math.round(avgPrice),
          },
          intensity: demand > 300 ? 'HIGH' : demand > 150 ? 'MEDIUM' : 'LOW',
        };
      });

    return {
      india: buildRegionData(indiaRegions),
      uae: buildRegionData(uaeRegions, true),
      updatedAt: new Date(),
    };
  }

  /**
   * Feature 10: Smart Recommendations Engine (Extended)
   * Includes warehouses and transporters
   */
  public static async getSmartRecommendations(userId: string, role: string) {
    const base = await this.getRecommendations(userId, role);

    const [warehouses, transporters] = await Promise.all([
      prisma.warehouseSpace.findMany({
        where: { status: 'ACTIVE', availableTons: { gt: 0 } },
        orderBy: { availableTons: 'desc' },
        take: 4,
      }),
      prisma.transportCarrier.findMany({
        where: { currentStatus: 'AVAILABLE' },
        orderBy: { ratePerKm: 'asc' },
        take: 4,
      }),
    ]);

    return {
      ...base,
      warehouses,
      transporters,
    };
  }

  /**
   * Feature 11: Personalized Home Feed
   */
  public static async getPersonalizedFeed(userId: string, role: string) {
    // Get user's past purchase interests
    const userOrders = await prisma.order.findMany({
      where: { buyerId: userId },
      include: { items: { include: { product: { select: { cropType: true } } } } },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    const interestedCrops = [...new Set(userOrders.flatMap((o) => o.items.map((i) => i.product.cropType)))];

    // Relevant products
    const relevantProducts = await prisma.product.findMany({
      where: {
        status: 'ACTIVE',
        ...(interestedCrops.length > 0 ? { cropType: { in: interestedCrops } } : {}),
      },
      include: { seller: { select: { profile: { select: { fullName: true } } } } },
      orderBy: [{ sellerVerification: 'desc' }, { createdAt: 'desc' }],
      take: 8,
    });

    // Trending opportunities
    const trendingOpportunities = await prisma.demandForecast.findMany({
      where: { demandScore: { gte: 70 } },
      orderBy: { demandScore: 'desc' },
      take: 5,
    });

    // Recommended buyers (for farmers)
    const recommendedBuyers = role === 'FARMER'
      ? await prisma.user.findMany({
          where: { role: { in: ['BUYER', 'EXPORTER'] } },
          select: { id: true, email: true, profile: true, trustScore: true },
          orderBy: { trustScore: 'desc' },
          take: 4,
        })
      : [];

    // Live auctions
    const liveAuctions = await prisma.auction.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { endTime: 'asc' },
      take: 3,
    });

    return {
      relevantProducts,
      trendingOpportunities,
      recommendedBuyers,
      liveAuctions,
      personalizedFor: { userId, role, interestedCrops },
    };
  }

  /**
   * Feature 12: Executive Dashboard Data
   */
  public static async getExecutiveDashboard() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalRevenue,
      tradeVolume,
      activeUsers,
      topProducts,
      ordersByStatus,
      revenueTimeline,
    ] = await Promise.all([
      // Total revenue (completed orders)
      prisma.order.aggregate({
        where: { status: 'COMPLETED' },
        _sum: { totalAmount: true },
      }),
      // Trade volume (all orders last 30d)
      prisma.order.aggregate({
        where: { createdAt: { gte: thirtyDaysAgo } },
        _sum: { totalAmount: true },
        _count: { id: true },
      }),
      // Active users last 30d
      prisma.user.count({ where: { updatedAt: { gte: thirtyDaysAgo } } }),
      // Top products by order items
      prisma.orderItem.groupBy({
        by: ['productId'],
        _sum: { quantity: true, price: true },
        _count: { id: true },
        orderBy: { _count: { id: 'desc' } },
        take: 5,
      }),
      // Orders by status
      prisma.order.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      // Monthly revenue for chart
      prisma.order.findMany({
        where: { status: 'COMPLETED', createdAt: { gte: new Date(Date.now() - 180 * 24 * 3600 * 1000) } },
        select: { totalAmount: true, createdAt: true },
      }),
    ]);

    // Resolve top products names
    const topProductDetails = await Promise.all(
      topProducts.map(async (tp) => {
        const product = await prisma.product.findUnique({
          where: { id: tp.productId },
          select: { title: true, cropType: true, imageUrl: true },
        });
        return { ...tp, product };
      }),
    );

    // Build 6-month revenue trend
    const monthlyRevenue: Record<string, number> = {};
    for (const order of revenueTimeline) {
      const key = new Date(order.createdAt).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
      monthlyRevenue[key] = (monthlyRevenue[key] ?? 0) + order.totalAmount;
    }

    // Top regions (from market rates)
    const topRegions = await prisma.marketRate.findMany({
      select: { crop: true, locationIndia: true, priceIndia: true, changeIndia: true },
      orderBy: { changeIndia: 'desc' },
      take: 5,
    });

    return {
      kpis: {
        totalRevenue: totalRevenue._sum.totalAmount ?? 0,
        tradeVolume30d: tradeVolume._sum.totalAmount ?? 0,
        ordersLast30d: tradeVolume._count.id,
        activeUsers,
        marketGrowthPct: 22.4, // Would be calculated vs prior period in production
      },
      revenueTimeline: Object.entries(monthlyRevenue).map(([month, amount]) => ({ month, amount })),
      topProducts: topProductDetails,
      orderStatusBreakdown: ordersByStatus,
      topRegions: topRegions.map((r) => ({
        name: r.locationIndia,
        crop: r.crop,
        avgPrice: r.priceIndia,
        trend: r.changeIndia > 0 ? 'UP' : 'DOWN',
      })),
      generatedAt: new Date(),
    };
  }

  /**
   * Feature 5: AI Agriculture Assistant (Chat)
   */
  public static async createChatSession(userId: string, title?: string) {
    return prisma.chatSession.create({
      data: {
        userId,
        title: title || 'New Agronomy Query',
      },
    });
  }

  public static async getChatSessions(userId: string) {
    return prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  public static async getChatMessages(sessionId: string, userId: string) {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundError('Chat session not found.');
    }

    return prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
    });
  }

  public static async sendMessage(sessionId: string, userId: string, messageContent: string) {
    const session = await prisma.chatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.userId !== userId) {
      throw new NotFoundError('Chat session not found.');
    }

    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'user',
        content: messageContent,
      },
    });

    // Generate dynamic, agronomical startup-grade assistant response
    const assistantResponseContent = this.generateAssistantReply(messageContent);

    // Save assistant message
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: assistantResponseContent,
      },
    });

    // Touch session updatedAt
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return {
      userMessage,
      assistantMessage,
    };
  }

  private static generateAssistantReply(input: string): string {
    const text = input.toLowerCase();

    if (text.includes('price') || text.includes('rate') || text.includes('market')) {
      return "Current MandiPrime indices show stable trade volumes. India Punjab Wheat is steady at ₹2,450/Quintal, while Jebel Ali Dubai imports stand around $1,350/Ton. For exact forecast projections, please visit our 'AI Crop Price Prediction' dashboard tab.";
    }

    if (text.includes('escrow') || text.includes('payment') || text.includes('secure')) {
      return "All transactions on MandiPrime employ our secure Smart Escrow system. Once a buyer funds an order, funds are held in secure escrow. They are only released to the farmer after successful customs clearance or domestic quality validation checks.";
    }

    if (text.includes('fertilizer') || text.includes('soil') || text.includes('pest') || text.includes('crop')) {
      return "For optimal crop yield, ensure soil testing is performed before winter sowing. High-grade nitrogen (N) and phosphorus (P) balances are recommended for wheat cultivation. Monitor for aphid infestations and apply biological treatments early.";
    }

    if (text.includes('dubai') || text.includes('export') || text.includes('shipping')) {
      return "MandiPrime facilitates premium cargo transit between India and the UAE (Dubai). Make sure your crops possess APEDA verification or equivalent quality tags before listing on the export category portal.";
    }

    return "Hello! I am your MandiPrime AI Agriculture Assistant. I can help you with crop disease identification, crop yields, fertilizer optimization, Smart Escrow payment systems, and Dubai/India commodity exchange queries. How can I assist you today?";
  }
}
