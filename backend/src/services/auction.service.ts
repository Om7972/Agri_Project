import prisma from '@/config/db';
import redisClient from '@/config/redis';
import { BadRequestError, NotFoundError, ForbiddenError } from '@/utils/apiErrors';
import { AuctionStatus, BidStatus, NotificationType } from '@prisma/client';

export class AuctionService {
  public static async createAuction(creatorId: string, input: any) {
    return prisma.auction.create({
      data: {
        creatorId,
        title: input.title,
        description: input.description,
        cropType: input.cropType,
        startPrice: input.startPrice,
        reservePrice: input.reservePrice,
        startTime: input.startTime,
        endTime: input.endTime,
        status: AuctionStatus.UPCOMING,
      },
    });
  }

  public static async placeBid(auctionId: string, bidderId: string, bidAmount: number) {
    const auction = await prisma.auction.findUnique({
      where: { id: auctionId },
    });

    if (!auction) {
      throw new NotFoundError('Auction not found.');
    }

    // Check status
    const now = new Date();
    if (auction.status !== AuctionStatus.ACTIVE && (now < auction.startTime || now > auction.endTime)) {
      throw new BadRequestError('This auction is not currently accepting bids.');
    }

    if (auction.creatorId === bidderId) {
      throw new BadRequestError('You cannot place a bid on your own auction.');
    }

    // Redis optimization: Get top bid from cache or DB
    const redisKey = `auction:${auctionId}:high_bid`;
    let currentHighBid = auction.currentHighBid || auction.startPrice;

    try {
      const cachedBid = await redisClient.get(redisKey);
      if (cachedBid) {
        currentHighBid = parseFloat(cachedBid);
      }
    } catch (err) {
      console.warn('Redis read failed in placeBid. Falling back to Postgres.');
    }

    if (bidAmount <= currentHighBid) {
      throw new BadRequestError(`Bid amount must be greater than current highest bid of ${currentHighBid}.`);
    }

    // Database update in transaction
    const bid = await prisma.$transaction(async (tx) => {
      // Create Bid record
      const newBid = await tx.bid.create({
        data: {
          auctionId,
          bidderId,
          bidAmount,
          status: BidStatus.PENDING,
        },
      });

      // Update Auction high bid
      await tx.auction.update({
        where: { id: auctionId },
        data: {
          currentHighBid: bidAmount,
          status: AuctionStatus.ACTIVE, // Force status to ACTIVE if first bid lands
        },
      });

      // Send alert to prior high bidder if exists
      const previousHighBid = await tx.bid.findFirst({
        where: {
          auctionId,
          id: { not: newBid.id },
        },
        orderBy: { bidAmount: 'desc' },
      });

      if (previousHighBid && previousHighBid.bidderId !== bidderId) {
        await tx.notification.create({
          data: {
            userId: previousHighBid.bidderId,
            title: 'Outbid Notification',
            message: `You have been outbid on auction "${auction.title}". The new highest bid is ${bidAmount}.`,
            type: NotificationType.BID_UPDATE,
          },
        });
      }

      return newBid;
    });

    // Cache updated value in Redis with TTL matching auction expiration
    try {
      const ttl = Math.max(1, Math.ceil((auction.endTime.getTime() - now.getTime()) / 1000));
      await redisClient.setEx(redisKey, ttl, bidAmount.toString());
    } catch (err) {
      console.warn('Redis write failed in placeBid.');
    }

    return bid;
  }

  public static async getAuctionById(id: string) {
    const auction = await prisma.auction.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        bids: {
          orderBy: { bidAmount: 'desc' },
          include: {
            bidder: {
              select: {
                id: true,
                profile: { select: { fullName: true } },
              },
            },
          },
        },
      },
    });

    if (!auction) {
      throw new NotFoundError('Auction not found.');
    }

    return auction;
  }

  public static async listAuctions(filters: {
    status?: AuctionStatus;
    cropType?: string;
    page?: number;
    limit?: number;
  }) {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (filters.status) {
      whereClause.status = filters.status;
    }
    if (filters.cropType) {
      whereClause.cropType = { equals: filters.cropType, mode: 'insensitive' };
    }

    const [auctions, totalItems] = await prisma.$transaction([
      prisma.auction.findMany({
        where: whereClause,
        orderBy: { endTime: 'asc' },
        skip,
        take: limit,
      }),
      prisma.auction.count({ where: whereClause }),
    ]);

    return {
      auctions,
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      },
    };
  }
}
