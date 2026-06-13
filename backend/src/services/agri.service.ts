import prisma from '@/config/db';
import { NotFoundError, BadRequestError, ForbiddenError } from '@/utils/apiErrors';
import { NotificationService } from '@/services/notification.service';
import { NotificationType } from '@prisma/client';

export class AgriService {
  /**
   * 1. Smart Marketplace / AI Smart Search Parser
   */
  public static async smartSearch(query: string) {
    const text = query.toLowerCase();

    // Extract Crop
    const crops = ['wheat', 'rice', 'onion', 'soybean', 'cotton', 'sugarcane', 'potato', 'tomato'];
    let cropType: string | undefined;
    for (const crop of crops) {
      if (text.includes(crop)) {
        cropType = crop;
        break;
      }
    }

    // Extract Price Limit
    let maxPrice: number | undefined;
    // Match "under 2500", "below ₹2800", "< 6500", etc.
    const priceMatch = text.match(/(?:under|below|less than|₹|\$|rs\.?)\s*(\d+)/i) || text.match(/(\d+)\s*(?:under|below|less than|rs|rupees)/i);
    if (priceMatch) {
      maxPrice = parseFloat(priceMatch[1]);
    } else {
      // General 3-5 digit number extraction as price threshold if crop mentioned
      const numMatches = text.match(/\b\d{3,5}\b/g);
      if (numMatches && numMatches.length > 0) {
        maxPrice = parseFloat(numMatches[0]);
      }
    }

    // Extract Location
    let location: string | undefined;
    const locationMatch = text.match(/(?:near|in|at|from)\s+([a-zA-Z\s]{3,20})/i);
    if (locationMatch) {
      const locationText = locationMatch[1].trim();
      // Skip query noise words
      if (!['rs', 'inr', 'rupees', 'export', 'quality'].includes(locationText)) {
        location = locationText;
      }
    } else {
      // Guessing based on popular locations
      const places = ['pune', 'maharashtra', 'gujarat', 'punjab', 'mumbai', 'haryana', 'karnataka', 'dubai', 'uae'];
      for (const p of places) {
        if (text.includes(p)) {
          location = p;
          break;
        }
      }
    }

    // Extract Quality/Grade
    let grade: string | undefined;
    if (text.includes('export') || text.includes('premium') || text.includes('elite') || text.includes('best')) {
      grade = 'Grade A+';
    }

    // Build query
    const whereClause: any = {
      status: 'ACTIVE',
    };

    if (cropType) {
      whereClause.cropType = { contains: cropType, mode: 'insensitive' };
    }

    if (maxPrice !== undefined) {
      whereClause.price = { lte: maxPrice };
    }

    if (grade) {
      whereClause.grade = { contains: grade, mode: 'insensitive' };
    }

    if (location) {
      whereClause.seller = {
        profile: {
          OR: [
            { city: { contains: location, mode: 'insensitive' } },
            { country: { contains: location, mode: 'insensitive' } },
            { address: { contains: location, mode: 'insensitive' } },
          ],
        },
      };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            email: true,
            trustScore: true,
            profile: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 15,
    });

    return {
      parsedCriteria: {
        cropType,
        maxPrice,
        location,
        grade,
      },
      products,
    };
  }

  /**
   * 2. Saved Searches Management
   */
  public static async createSavedSearch(userId: string, query: string, filters: any) {
    return prisma.savedSearch.create({
      data: {
        userId,
        query,
        filters: filters || {},
      },
    });
  }

  public static async listSavedSearches(userId: string) {
    return prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async deleteSavedSearch(id: string, userId: string) {
    const item = await prisma.savedSearch.findUnique({ where: { id } });
    if (!item) throw new NotFoundError('Saved search not found.');
    if (item.userId !== userId) throw new ForbiddenError('Unauthorized.');
    return prisma.savedSearch.delete({ where: { id } });
  }

  // Trigger matches for saved searches when a new product is listed
  public static async checkSavedSearches(product: any) {
    try {
      const activeSearches = await prisma.savedSearch.findMany({
        include: { user: true },
      });

      for (const search of activeSearches) {
        const filters = search.filters as any;
        let matches = true;

        // Check crop type match
        if (filters.cropType && product.cropType.toLowerCase() !== filters.cropType.toLowerCase()) {
          matches = false;
        }
        // Check price threshold
        if (filters.maxPrice && product.price > filters.maxPrice) {
          matches = false;
        }
        // Check grade match
        if (filters.grade && !product.grade.toLowerCase().includes(filters.grade.toLowerCase())) {
          matches = false;
        }

        if (matches) {
          // Send notification
          await NotificationService.sendInAppNotification(
            search.userId,
            'New Crop Match Available!',
            `A new crop listing "${product.title}" (${product.cropType}) matches your saved search query "${search.query}".`,
            NotificationType.INFO
          );

          // Attempt Email Notification
          await NotificationService.sendEmail(
            search.user.email,
            'MandiPrime - Crop Match Alert!',
            `<h3>New Crop Match Found!</h3>
             <p>Hello,</p>
             <p>A new listing matches your saved search criteria:</p>
             <ul>
               <li><strong>Title:</strong> ${product.title}</li>
               <li><strong>Price:</strong> ${product.price} / ${product.unit}</li>
               <li><strong>Grade:</strong> ${product.grade}</li>
               <li><strong>Stock Available:</strong> ${product.stock}</li>
             </ul>
             <p><a href="http://localhost:3000/marketplace">View Crop Listing on MandiPrime</a></p>`
          );
        }
      }
    } catch (err: any) {
      console.error('Error matching saved searches:', err.message);
    }
  }

  /**
   * 3. Price Alerts Management
   */
  public static async createPriceAlert(userId: string, cropType: string, targetPrice: number, condition: string) {
    return prisma.priceAlert.create({
      data: {
        userId,
        cropType,
        targetPrice,
        condition, // "GREATER_THAN" or "LESS_THAN"
        isActive: true,
      },
    });
  }

  public static async listPriceAlerts(userId: string) {
    return prisma.priceAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async deletePriceAlert(id: string, userId: string) {
    const alert = await prisma.priceAlert.findUnique({ where: { id } });
    if (!alert) throw new NotFoundError('Price alert not found.');
    if (alert.userId !== userId) throw new ForbiddenError('Unauthorized.');
    return prisma.priceAlert.delete({ where: { id } });
  }

  // Trigger matches for price alerts when product is listed or commodity rate changes
  public static async checkPriceAlerts(product: any) {
    try {
      const activeAlerts = await prisma.priceAlert.findMany({
        where: {
          cropType: { equals: product.cropType, mode: 'insensitive' },
          isActive: true,
        },
        include: { user: true },
      });

      for (const alert of activeAlerts) {
        let triggers = false;

        if (alert.condition === 'GREATER_THAN' && product.price >= alert.targetPrice) {
          triggers = true;
        } else if (alert.condition === 'LESS_THAN' && product.price <= alert.targetPrice) {
          triggers = true;
        }

        if (triggers) {
          // Notify User
          await NotificationService.sendInAppNotification(
            alert.userId,
            'Price Alert Triggered!',
            `Price Alert: ${product.cropType} has reached ${product.price} (Target: ${alert.condition === 'GREATER_THAN' ? '>' : '<'} ${alert.targetPrice}).`,
            NotificationType.ORDER_UPDATE
          );

          // Email Notification
          await NotificationService.sendEmail(
            alert.user.email,
            `MandiPrime - Price Alert Triggered for ${product.cropType}!`,
            `<h3>Price Alert Triggered!</h3>
             <p>Hello,</p>
             <p>Your price threshold has been crossed for <strong>${product.cropType}</strong>.</p>
             <ul>
               <li><strong>New Listing:</strong> ${product.title}</li>
               <li><strong>Listing Price:</strong> INR ${product.price}</li>
               <li><strong>Your Target Price Alert:</strong> ${alert.condition === 'GREATER_THAN' ? 'Above' : 'Below'} INR ${alert.targetPrice}</li>
             </ul>
             <p><a href="http://localhost:3000/marketplace">View Spot Commodity Listings</a></p>`
          );

          // Soft deactivate price alert
          await prisma.priceAlert.update({
            where: { id: alert.id },
            data: { isActive: false },
          });
        }
      }
    } catch (err: any) {
      console.error('Error matching price alerts:', err.message);
    }
  }

  /**
   * 4. Smart Negotiation Chat
   */
  public static async createNegotiation(buyerId: string, productId: string, targetPrice: number) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) throw new NotFoundError('Product not found.');
    if (product.sellerId === buyerId) throw new BadRequestError('Sellers cannot negotiate with themselves.');

    // Create negotiation log
    return prisma.negotiation.create({
      data: {
        buyerId,
        sellerId: product.sellerId,
        productId,
        originalPrice: product.price,
        currentPrice: targetPrice,
        status: 'PENDING',
        messages: {
          create: {
            senderId: buyerId,
            content: `Initiated negotiation. Bid offered: INR ${targetPrice} per unit (Listing: INR ${product.price}).`,
          },
        },
      },
      include: {
        product: true,
        messages: true,
      },
    });
  }

  public static async sendNegotiationMessage(negotiationId: string, senderId: string, content: string, fileUrl?: string) {
    const negotiation = await prisma.negotiation.findUnique({ where: { id: negotiationId } });
    if (!negotiation) throw new NotFoundError('Negotiation session not found.');

    if (negotiation.buyerId !== senderId && negotiation.sellerId !== senderId) {
      throw new ForbiddenError('Unauthorized participation.');
    }

    // Check if message content specifies a price update
    // E.g., "counter offer: 2600" or similar
    const priceMatch = content.match(/(?:offer|counter|price|bid|give)\s*(?:of|at|to|:|is)?\s*₹?\s*(\d+(\.\d+)?)/i);
    let updatedPrice = negotiation.currentPrice;
    if (priceMatch) {
      updatedPrice = parseFloat(priceMatch[1]);
    }

    // Save message and update current negotiation price
    const [msg] = await prisma.$transaction([
      prisma.negotiationMessage.create({
        data: {
          negotiationId,
          senderId,
          content,
          fileUrl,
        },
      }),
      prisma.negotiation.update({
        where: { id: negotiationId },
        data: {
          currentPrice: updatedPrice,
          updatedAt: new Date(),
        },
      }),
    ]);

    // Send notifications to counterpart
    const counterpartId = negotiation.buyerId === senderId ? negotiation.sellerId : negotiation.buyerId;
    await NotificationService.sendInAppNotification(
      counterpartId,
      'Negotiation Message',
      `New chat message/offer regarding negotiation contract #${negotiationId.slice(0, 6)}: "${content.slice(0, 40)}..."`,
      NotificationType.INFO
    );

    return msg;
  }

  public static async updateNegotiationStatus(negotiationId: string, userId: string, status: string) {
    const negotiation = await prisma.negotiation.findUnique({
      where: { id: negotiationId },
      include: { product: true },
    });
    if (!negotiation) throw new NotFoundError('Negotiation not found.');

    // Only buyer or seller can accept/reject
    if (negotiation.buyerId !== userId && negotiation.sellerId !== userId) {
      throw new ForbiddenError('Unauthorized.');
    }

    const updated = await prisma.negotiation.update({
      where: { id: negotiationId },
      data: { status },
    });

    // Notify counterpart
    const counterpartId = negotiation.buyerId === userId ? negotiation.sellerId : negotiation.buyerId;
    await NotificationService.sendInAppNotification(
      counterpartId,
      `Negotiation ${status}`,
      `The bid counter-offer of INR ${negotiation.currentPrice} has been ${status.toLowerCase()} by the counterpart.`,
      NotificationType.ORDER_UPDATE
    );

    // If accepted, we can automatically trigger order creation or let them handle it.
    return updated;
  }

  public static async getNegotiationHistory(negotiationId: string, userId: string) {
    const neg = await prisma.negotiation.findUnique({
      where: { id: negotiationId },
      include: {
        messages: { orderBy: { createdAt: 'asc' } },
        product: true,
        buyer: { select: { email: true, profile: true } },
        seller: { select: { email: true, profile: true } },
      },
    });

    if (!neg) throw new NotFoundError('Negotiation not found.');
    if (neg.buyerId !== userId && neg.sellerId !== userId) {
      throw new ForbiddenError('Unauthorized access.');
    }

    return neg;
  }

  public static async getNegotiations(userId: string, role: string) {
    if (role === 'FARMER') {
      return prisma.negotiation.findMany({
        where: { sellerId: userId },
        include: { product: true, buyer: { select: { email: true, profile: true } } },
        orderBy: { updatedAt: 'desc' },
      });
    } else {
      return prisma.negotiation.findMany({
        where: { buyerId: userId },
        include: { product: true, seller: { select: { email: true, profile: true } } },
        orderBy: { updatedAt: 'desc' },
      });
    }
  }

  /**
   * 5. Digital Contract Generation
   */
  public static async generateContract(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        buyer: { include: { profile: true } },
        seller: { include: { profile: true } },
        items: { include: { product: true } },
      },
    });

    if (!order) throw new NotFoundError('Order not found.');
    if (order.buyerId !== userId && order.sellerId !== userId) {
      throw new ForbiddenError('Unauthorized access to order contract.');
    }

    const product = order.items[0]?.product;
    const quantity = order.items[0]?.quantity || 0;
    const crop = product?.cropType || 'Commodity';
    const price = product?.price || 0;
    const buyerName = order.buyer.profile?.fullName || order.buyer.email;
    const sellerName = order.seller.profile?.fullName || order.seller.email;

    const terms = `
DIGITAL SALES CONTRACT & ESCROW DEED

Date: ${new Date(order.createdAt).toLocaleDateString()}
Contract Reference: MandiPrime-CTR-${orderId.slice(0, 8).toUpperCase()}

1. CONTRACTING PARTIES
----------------------
BUYER:
Name: ${buyerName}
User ID: ${order.buyerId}
Email: ${order.buyer.email}

SELLER:
Name: ${sellerName}
User ID: ${order.sellerId}
Email: ${order.seller.email}

2. COMMODITY AND SPECIFICATIONS
-------------------------------
Crop Commodity: ${crop}
Grade Quality: ${product?.grade || 'Grade A'}
Quantity Ordered: ${quantity} ${product?.unit || 'Units'}
Seller Trust Rating: ${order.seller.trustScore.toFixed(1)}/100

3. SETTLEMENT AND ESCROW POLICIES
----------------------------------
Unit Rate: INR ${price} per unit
Total Amount: INR ${order.totalAmount}
Payment Status: Locked in MandiPrime Safe Escrow. 
Escrow Release Term: Funds will be released automatically to the seller upon confirmation of shipment delivery at target destination port, or within 48 hours of delivery status update unless a dispute is flagged.

4. LOGISTICS & FREIGHT CARRIER
-------------------------------
Transit Hub route: ${order.seller.profile?.city || 'Origin'} to ${order.buyer.profile?.city || 'Destination'}
Compliance certificates attached: APEDA phytosanitary, standard crop quality tags.

5. SIGNATURE & STAMP
---------------------
Digitally verified and sealed by MandiPrime Ledger Authority.
Buyer Signature Code: MD5_B_${order.buyerId.slice(0, 8)}
Seller Signature Code: MD5_S_${order.sellerId.slice(0, 8)}
    `.trim();

    const pdfUrl = `http://localhost:5000/api/v1/orders/${orderId}/contract/pdf`;

    let contract = await prisma.contract.findUnique({ where: { orderId } });
    if (!contract) {
      contract = await prisma.contract.create({
        data: {
          orderId,
          pdfUrl,
          contractTerms: terms,
        },
      });
    }

    return contract;
  }

  public static async getContract(orderId: string, userId: string) {
    const contract = await prisma.contract.findUnique({
      where: { orderId },
      include: {
        order: {
          include: {
            buyer: { select: { email: true, profile: true } },
            seller: { select: { email: true, profile: true } },
          },
        },
      },
    });

    if (!contract) throw new NotFoundError('Contract not generated yet.');
    if (contract.order.buyerId !== userId && contract.order.sellerId !== userId) {
      throw new ForbiddenError('Unauthorized access.');
    }

    return contract;
  }

  /**
   * 6. Trust Score System
   */
  public static async calculateTrustScore(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        ordersAsSeller: { include: { shipment: true } },
        reviewsReceived: true,
      },
    });

    if (!user) return 80.0;

    // Completed orders count
    const completedOrders = user.ordersAsSeller.filter((o) => o.status === 'COMPLETED').length;

    // Average rating
    let avgRating = 4.0;
    if (user.reviewsReceived.length > 0) {
      avgRating = user.reviewsReceived.reduce((acc, r) => acc + r.rating, 0) / user.reviewsReceived.length;
    }

    // Verification score: check if has Elite tags
    const products = await prisma.product.findMany({ where: { sellerId: userId } });
    const hasElite = products.some((p) => p.sellerVerification === 'Elite');
    const verificationScore = hasElite ? 100 : 80;

    // Delivery performance
    let deliveryRate = 1.0;
    const totalShipments = user.ordersAsSeller.filter((o) => o.shipment !== null).length;
    if (totalShipments > 0) {
      const deliveredShipments = user.ordersAsSeller.filter((o) => o.shipment?.status === 'DELIVERED').length;
      deliveryRate = deliveredShipments / totalShipments;
    }

    // Weight allocation:
    // 30% completed orders count (capped at 10 completed orders for max score)
    // 30% average rating (5 stars = 30 points)
    // 20% verification level (Elite = 20, Standard = 16)
    // 20% delivery performance
    const orderPoints = Math.min(30, completedOrders * 3);
    const ratingPoints = avgRating * 6; // 5 * 6 = 30
    const verificationPoints = verificationScore * 0.2; // 100 * 0.2 = 20
    const deliveryPoints = deliveryRate * 20;

    const trustScore = Math.min(100, Math.max(0, orderPoints + ratingPoints + verificationPoints + deliveryPoints));

    await prisma.user.update({
      where: { id: userId },
      data: { trustScore },
    });

    return trustScore;
  }
}
