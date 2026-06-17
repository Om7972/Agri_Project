import prisma from '@/config/db';
import { NotFoundError, BadRequestError } from '@/utils/apiErrors';
import { WalletService } from './wallet.service';

export class EscrowService {
  public static async fundEscrow(orderId: string, buyerId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new NotFoundError('Order not found.');
    if (order.buyerId !== buyerId) throw new BadRequestError('Only buyer can fund escrow.');

    const existing = await prisma.escrow.findUnique({ where: { orderId } });
    if (existing) throw new BadRequestError('Escrow already exists for this order.');

    await WalletService.debit(buyerId, order.totalAmount, 'ESCROW_HOLD', `Escrow hold for order ${orderId}`, orderId);

    const escrow = await prisma.escrow.create({
      data: { orderId, amount: order.totalAmount, status: 'FUNDED' },
    });

    await prisma.order.update({ where: { id: orderId }, data: { status: 'ESCROW_FUNDED', paymentStatus: 'ESCROWED' } });
    return escrow;
  }

  public static async releaseEscrow(orderId: string) {
    const escrow = await prisma.escrow.findUnique({ where: { orderId }, include: { order: true } });
    if (!escrow) throw new NotFoundError('Escrow not found.');
    if (escrow.status !== 'FUNDED' && escrow.status !== 'HELD') throw new BadRequestError('Escrow is not in a releasable state.');

    await WalletService.credit(escrow.order.sellerId, escrow.amount, 'ESCROW_RELEASE', `Escrow release for order ${orderId}`, orderId);

    const updated = await prisma.escrow.update({
      where: { id: escrow.id },
      data: { status: 'RELEASED', releasedAt: new Date() },
    });

    await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'RELEASED', status: 'COMPLETED' } });
    return updated;
  }

  public static async refundEscrow(orderId: string) {
    const escrow = await prisma.escrow.findUnique({ where: { orderId }, include: { order: true } });
    if (!escrow) throw new NotFoundError('Escrow not found.');
    if (escrow.status === 'RELEASED') throw new BadRequestError('Escrow already released.');

    await WalletService.credit(escrow.order.buyerId, escrow.amount, 'REFUND', `Escrow refund for order ${orderId}`, orderId);

    const updated = await prisma.escrow.update({
      where: { id: escrow.id },
      data: { status: 'REFUNDED', refundedAt: new Date() },
    });

    await prisma.order.update({ where: { id: orderId }, data: { paymentStatus: 'REFUNDED', status: 'CANCELLED' } });
    return updated;
  }

  public static async getEscrowByOrder(orderId: string) {
    const escrow = await prisma.escrow.findUnique({ where: { orderId } });
    if (!escrow) throw new NotFoundError('No escrow found for this order.');
    return escrow;
  }
}
