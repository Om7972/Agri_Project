import prisma from '@/config/db';
import { BadRequestError, NotFoundError, ForbiddenError } from '@/utils/apiErrors';
import { OrderStatus, PaymentStatus, NotificationType } from '@prisma/client';
import { AgriService } from './agri.service';

export class OrderService {
  public static async createOrder(buyerId: string, productId: string, quantity: number) {
    // Retrieve product details
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundError('Product not found.');
    }

    if (product.sellerId === buyerId) {
      throw new BadRequestError('Sellers cannot purchase their own listed products.');
    }

    if (product.stock < quantity) {
      throw new BadRequestError(`Insufficient stock. Only ${product.stock} units available.`);
    }

    const totalAmount = product.price * quantity;

    // Transaction to create order and decrement stock
    const order = await prisma.$transaction(async (tx) => {
      // Decrement product stock
      await tx.product.update({
        where: { id: productId },
        data: {
          stock: {
            decrement: quantity,
          },
        },
      });

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          buyerId,
          sellerId: product.sellerId,
          totalAmount,
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.UNPAID,
          items: {
            create: {
              productId,
              quantity,
              price: product.price,
            },
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });

      // Send initial notifications
      await tx.notification.create({
        data: {
          userId: product.sellerId,
          title: 'New Bid / Contract Offer Received',
          message: `A buyer has placed an order for ${quantity} ${product.unit} of your ${product.title}.`,
          type: NotificationType.ORDER_UPDATE,
        },
      });

      return newOrder;
    });

    return order;
  }

  public static async updateOrderStatus(
    orderId: string,
    userId: string,
    userRole: string,
    status?: OrderStatus,
    paymentStatus?: PaymentStatus
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found.');
    }

    // Authorization: Only Buyer, Seller, or Admin can update
    const isBuyer = order.buyerId === userId;
    const isSeller = order.sellerId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (!isBuyer && !isSeller && !isAdmin) {
      throw new ForbiddenError('You are not authorized to view or edit this order.');
    }

    const updatedData: any = {};
    if (status) updatedData.status = status;
    if (paymentStatus) updatedData.paymentStatus = paymentStatus;

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: updatedData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Notify respective parties of updates
    const notificationsToCreate = [];

    if (status) {
      // If buyer funded escrow
      if (status === OrderStatus.ESCROW_FUNDED) {
        notificationsToCreate.push({
          userId: order.sellerId,
          title: 'Escrow Secured',
          message: `Escrow funds of ${order.totalAmount} have been secured. You can now dispatch the commodities safely.`,
          type: NotificationType.PAYMENT,
        });
      }
      // If seller dispatched order
      if (status === OrderStatus.DISPATCHED) {
        notificationsToCreate.push({
          userId: order.buyerId,
          title: 'Commodities Dispatched',
          message: `Your contract items for Order #${order.id.slice(0, 8)} have been dispatched by the seller.`,
          type: NotificationType.ORDER_UPDATE,
        });
      }
      // If completed
      if (status === OrderStatus.COMPLETED) {
        notificationsToCreate.push({
          userId: order.sellerId,
          title: 'Contract Successfully Closed',
          message: `Order #${order.id.slice(0, 8)} has been completed and funds released from escrow.`,
          type: NotificationType.PAYMENT,
        });

        // Recalculate seller trust score
        AgriService.calculateTrustScore(order.sellerId).catch(console.error);
      }
    }

    if (notificationsToCreate.length > 0) {
      await prisma.notification.createMany({
        data: notificationsToCreate,
      });
    }

    return updatedOrder;
  }

  public static async getOrderById(orderId: string, userId: string, userRole: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        buyer: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
        seller: {
          select: {
            id: true,
            email: true,
            profile: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundError('Order not found.');
    }

    if (order.buyerId !== userId && order.sellerId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenError('Access denied.');
    }

    return order;
  }

  public static async listUserOrders(userId: string, role: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (role === 'BUYER' || role === 'EXPORTER') {
      whereClause.buyerId = userId;
    } else if (role === 'FARMER') {
      whereClause.sellerId = userId;
    }

    const [orders, totalItems] = await prisma.$transaction([
      prisma.order.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.order.count({ where: whereClause }),
    ]);

    return {
      orders,
      meta: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit,
      },
    };
  }
}
