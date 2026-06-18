import prisma from '@/config/db';
import { NotFoundError, BadRequestError } from '@/utils/apiErrors';

export class NewFeaturesService {
  
  // ==================== 1. REVERSE AUCTION MARKETPLACE ====================
  public static async createReverseAuction(buyerId: string, data: { cropType: string; quantityTons: number; maxPricePerTon: number; deliveryLocation: string; deadline: string }) {
    return prisma.reverseAuction.create({
      data: {
        buyerId,
        cropType: data.cropType,
        quantityTons: data.quantityTons,
        maxPricePerTon: data.maxPricePerTon,
        deliveryLocation: data.deliveryLocation,
        deadline: new Date(data.deadline),
      },
    });
  }

  public static async getReverseAuctions() {
    return prisma.reverseAuction.findMany({
      include: {
        bids: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async placeReverseBid(farmerId: string, data: { auctionId: string; pricePerTon: number; deliveryDays: number }) {
    const auction = await prisma.reverseAuction.findUnique({
      where: { id: data.auctionId },
    });

    if (!auction) throw new NotFoundError('Reverse auction not found.');
    if (auction.status !== 'ACTIVE') throw new BadRequestError('Reverse auction is no longer active.');
    if (data.pricePerTon > auction.maxPricePerTon) {
      throw new BadRequestError(`Bid price exceeds the maximum budget of ${auction.maxPricePerTon}.`);
    }

    // Get farmer trust score
    const farmer = await prisma.user.findUnique({ where: { id: farmerId } });
    const trustScore = farmer ? farmer.trustScore : 80.0;

    return prisma.reverseBid.create({
      data: {
        auctionId: data.auctionId,
        farmerId,
        pricePerTon: data.pricePerTon,
        deliveryDays: data.deliveryDays,
        trustScore,
      },
    });
  }

  public static async getBidsForAuction(auctionId: string) {
    return prisma.reverseBid.findMany({
      where: { auctionId },
      orderBy: [
        { pricePerTon: 'asc' }, // lower price ranks higher
        { deliveryDays: 'asc' },
        { trustScore: 'desc' },
      ],
    });
  }

  public static async selectReverseAuctionWinner(buyerId: string, auctionId: string, bidId: string) {
    const auction = await prisma.reverseAuction.findUnique({
      where: { id: auctionId },
    });

    if (!auction) throw new NotFoundError('Reverse auction not found.');
    if (auction.buyerId !== buyerId) throw new BadRequestError('Only the buyer who posted this request can select the winner.');

    const targetBid = await prisma.reverseBid.findUnique({ where: { id: bidId } });
    if (!targetBid || targetBid.auctionId !== auctionId) throw new NotFoundError('Bid not found.');

    // Update target bid status to WINNER, others to REJECTED
    await prisma.reverseBid.updateMany({
      where: { auctionId, id: { not: bidId } },
      data: { status: 'REJECTED' },
    });

    await prisma.reverseBid.update({
      where: { id: bidId },
      data: { status: 'WINNER' },
    });

    return prisma.reverseAuction.update({
      where: { id: auctionId },
      data: { status: 'COMPLETED' },
    });
  }

  // ==================== 2. COMMUNITY MARKETPLACE ====================
  public static async createCommunityPost(userId: string, userEmail: string, data: { communityName: string; content: string; imageUrl?: string; language?: string }) {
    return prisma.communityPost.create({
      data: {
        communityName: data.communityName,
        userId,
        userEmail,
        content: data.content,
        imageUrl: data.imageUrl,
        language: data.language || 'EN',
      },
    });
  }

  public static async getCommunityPosts(communityName?: string) {
    const filter = communityName ? { communityName } : {};
    return prisma.communityPost.findMany({
      where: filter,
      include: {
        comments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async addComment(userId: string, userEmail: string, postId: string, content: string) {
    const post = await prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundError('Community post not found.');

    return prisma.communityComment.create({
      data: {
        postId,
        userId,
        userEmail,
        content,
      },
    });
  }

  public static async likePost(postId: string) {
    const post = await prisma.communityPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundError('Community post not found.');

    return prisma.communityPost.update({
      where: { id: postId },
      data: {
        likesCount: { increment: 1 },
      },
    });
  }

  // ==================== 3. AGRICULTURAL EVENTS PLATFORM ====================
  public static async createAgriEvent(data: { title: string; description: string; type: string; date: string; location: string; bannerUrl?: string }) {
    return prisma.agriEvent.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        date: new Date(data.date),
        location: data.location,
        bannerUrl: data.bannerUrl,
      },
    });
  }

  public static async getAgriEvents() {
    return prisma.agriEvent.findMany({
      include: {
        registrations: true,
      },
      orderBy: { date: 'asc' },
    });
  }

  public static async registerForEvent(userId: string, userEmail: string, eventId: string) {
    const event = await prisma.agriEvent.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundError('Event not found.');

    // Check if already registered
    const existing = await prisma.eventRegistration.findFirst({
      where: { eventId, userId },
    });
    if (existing) throw new BadRequestError('You are already registered for this event.');

    const ticketCode = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;

    return prisma.eventRegistration.create({
      data: {
        eventId,
        userId,
        userEmail,
        ticketCode,
      },
    });
  }

  // ==================== 4. SMART RFQ SYSTEM ====================
  public static async generateRFQQuotationPDF(farmerId: string, data: { buyerRequirementId: string; offeredPrice: number; quantityTons: number; notes?: string }) {
    // Check bulk requirement
    const requirement = await prisma.bulkRequirement.findUnique({
      where: { id: data.buyerRequirementId },
    });
    if (!requirement) throw new NotFoundError('Procurement requirement not found.');

    // Create the farmer quotation
    const quotation = await prisma.farmerQuotation.create({
      data: {
        requirementId: data.buyerRequirementId,
        farmerId,
        offeredPrice: data.offeredPrice,
        quantityTons: data.quantityTons,
        notes: data.notes,
      },
    });

    // Mock a beautiful PDF generation response url
    const pdfUrl = `https://res.cloudinary.com/mandiprime/raw/upload/v1672345/rfq_quotes/RFQ_${quotation.id}.pdf`;

    return {
      quotation,
      pdfUrl,
      documentName: `RFQ-Quotation-${quotation.id.slice(0, 8)}.pdf`,
    };
  }

  // ==================== 5. WAREHOUSE RECEIPT SYSTEM ====================
  public static async generateWarehouseReceipt(farmerId: string, farmerEmail: string, data: { warehouseId: string; cropType: string; quantityTons: number; grade: string; storageDurationDays: number }) {
    const receiptNumber = `WR-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return prisma.warehouseReceipt.create({
      data: {
        receiptNumber,
        warehouseId: data.warehouseId,
        farmerId,
        farmerEmail,
        cropType: data.cropType,
        quantityTons: data.quantityTons,
        grade: data.grade,
        storageDurationDays: data.storageDurationDays,
      },
    });
  }

  public static async getWarehouseReceipts(userId: string, role: string) {
    if (role === 'FARMER') {
      return prisma.warehouseReceipt.findMany({
        where: { farmerId: userId },
        orderBy: { depositDate: 'desc' },
      });
    } else {
      // Return all receipts for warehouse managers/admins
      return prisma.warehouseReceipt.findMany({
        orderBy: { depositDate: 'desc' },
      });
    }
  }

  public static async requestWarehouseRelease(receiptId: string) {
    const receipt = await prisma.warehouseReceipt.findUnique({ where: { id: receiptId } });
    if (!receipt) throw new NotFoundError('Warehouse receipt not found.');

    return prisma.warehouseReceipt.update({
      where: { id: receiptId },
      data: { status: 'RELEASE_REQUESTED' },
    });
  }

  public static async approveWarehouseRelease(receiptId: string) {
    const receipt = await prisma.warehouseReceipt.findUnique({ where: { id: receiptId } });
    if (!receipt) throw new NotFoundError('Warehouse receipt not found.');

    return prisma.warehouseReceipt.update({
      where: { id: receiptId },
      data: { status: 'RELEASED' },
    });
  }

  // ==================== 6. COOPERATIVE GROUPS ====================
  public static async createCooperative(leaderId: string, leaderEmail: string, data: { name: string; description?: string }) {
    return prisma.cooperativeGroup.create({
      data: {
        name: data.name,
        description: data.description,
        leaderId,
        leaderEmail,
        members: {
          create: {
            farmerId: leaderId,
            farmerEmail: leaderEmail,
          },
        },
      },
    });
  }

  public static async joinCooperative(farmerId: string, farmerEmail: string, groupName: string) {
    const group = await prisma.cooperativeGroup.findUnique({
      where: { name: groupName },
    });

    if (!group) throw new NotFoundError('Cooperative group not found.');

    // Check if already a member
    const existing = await prisma.cooperativeMember.findFirst({
      where: { groupId: group.id, farmerId },
    });

    if (existing) throw new BadRequestError('You are already a member of this cooperative group.');

    return prisma.cooperativeMember.create({
      data: {
        groupId: group.id,
        farmerId,
        farmerEmail,
      },
    });
  }

  public static async getCooperatives() {
    return prisma.cooperativeGroup.findMany({
      include: {
        members: true,
        sharedInventory: true,
      },
    });
  }

  public static async addSharedInventory(groupId: string, data: { cropType: string; quantityTons: number; grade: string; pricePerTon: number }) {
    return prisma.cooperativeInventory.create({
      data: {
        groupId,
        cropType: data.cropType,
        quantityTons: data.quantityTons,
        grade: data.grade,
        pricePerTon: data.pricePerTon,
      },
    });
  }

  // ==================== 7. REFERRAL PROGRAM ====================
  public static async generateReferralCode(referrerId: string, referrerEmail: string) {
    const existing = await prisma.referral.findFirst({
      where: { referrerId },
    });

    if (existing) {
      return existing;
    }

    const referralCode = `MANDI-${referrerEmail.split('@')[0].toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    return prisma.referral.create({
      data: {
        referrerId,
        referrerEmail,
        referralCode,
        status: 'PENDING',
      },
    });
  }

  public static async completeReferralRegistration(referredId: string, referredEmail: string, referralCode: string) {
    const referral = await prisma.referral.findUnique({
      where: { referralCode },
    });

    if (!referral) throw new NotFoundError('Referral code not found.');
    if (referral.status === 'COMPLETED') throw new BadRequestError('Referral code already used.');

    // Update referrer's wallet or rewards points, and link referred user
    await prisma.referral.update({
      where: { referralCode },
      data: {
        referredId,
        referredEmail,
        rewardPoints: 100, // Reward referrer 100 points
        status: 'COMPLETED',
      },
    });

    // Also credit wallet cashback if needed
    const wallet = await prisma.wallet.findUnique({ where: { userId: referral.referrerId } });
    if (wallet) {
      await prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'CASHBACK',
          amount: 50.0, // Give 50 INR/Credits cashback
          description: `Referral signup reward for inviting ${referredEmail}`,
        },
      });

      await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: { increment: 50.0 },
        },
      });
    }

    return { success: true };
  }

  public static async getReferralLeaderboard() {
    return prisma.referral.findMany({
      where: { status: 'COMPLETED' },
      orderBy: { rewardPoints: 'desc' },
      take: 10,
    });
  }

  // ==================== 8. NOTIFICATION PREFERENCES ====================
  public static async getNotificationPreferences(userId: string) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  public static async updateNotificationPreferences(userId: string, data: { email?: boolean; sms?: boolean; whatsapp?: boolean; push?: boolean }) {
    return prisma.notificationPreference.upsert({
      where: { userId },
      update: {
        email: data.email,
        sms: data.sms,
        whatsapp: data.whatsapp,
        push: data.push,
      },
      create: {
        userId,
        email: data.email ?? true,
        sms: data.sms ?? false,
        whatsapp: data.whatsapp ?? false,
        push: data.push ?? true,
      },
    });
  }
}
