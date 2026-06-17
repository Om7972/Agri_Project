import prisma from '@/config/db';
import { DisputeStatus } from '@prisma/client';
import { NotFoundError, BadRequestError } from '@/utils/apiErrors';

export class DisputeService {
  public static async openDispute(data: { orderId: string; openedById: string; againstId: string; reason: string; description: string }) {
    const order = await prisma.order.findUnique({ where: { id: data.orderId } });
    if (!order) throw new NotFoundError('Order not found.');
    const dispute = await prisma.dispute.create({ data: { ...data, status: 'OPEN' } });
    return dispute;
  }

  public static async getDispute(id: string) {
    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: { messages: { include: { sender: { select: { id: true, email: true, role: true } } }, orderBy: { createdAt: 'asc' } }, evidence: true, openedBy: { select: { id: true, email: true } }, against: { select: { id: true, email: true } } },
    });
    if (!dispute) throw new NotFoundError('Dispute not found.');
    return dispute;
  }

  public static async listDisputes(userId?: string, status?: DisputeStatus) {
    const where: any = {};
    if (userId) where.OR = [{ openedById: userId }, { againstId: userId }];
    if (status) where.status = status;
    return prisma.dispute.findMany({ where, orderBy: { createdAt: 'desc' }, include: { openedBy: { select: { id: true, email: true } }, against: { select: { id: true, email: true } } } });
  }

  public static async addMessage(disputeId: string, senderId: string, content: string, isMediator = false) {
    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new NotFoundError('Dispute not found.');
    return prisma.disputeMessage.create({ data: { disputeId, senderId, content, isMediator } });
  }

  public static async uploadEvidence(disputeId: string, uploadedBy: string, fileUrl: string, fileType: string, notes?: string) {
    const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
    if (!dispute) throw new NotFoundError('Dispute not found.');
    return prisma.disputeEvidence.create({ data: { disputeId, uploadedBy, fileUrl, fileType, notes } });
  }

  public static async updateStatus(disputeId: string, status: DisputeStatus, mediatorNote?: string) {
    const data: any = { status };
    if (mediatorNote) data.mediatorNote = mediatorNote;
    if (status === 'RESOLVED_BUYER' || status === 'RESOLVED_SELLER' || status === 'CLOSED') data.resolvedAt = new Date();
    return prisma.dispute.update({ where: { id: disputeId }, data });
  }
}
