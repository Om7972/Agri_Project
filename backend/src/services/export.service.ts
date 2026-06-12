import prisma from '@/config/db';
import { logger } from '@/utils/logger';
import { DocumentType, DocumentStatus, ShipmentStatus } from '@prisma/client';
import { NotFoundError } from '@/utils/apiErrors';

export class ExportService {
  /**
   * Create an export shipment
   */
  public static async createShipment(data: {
    orderId: string;
    carrier: string;
    origin: string;
    destination: string;
    estimatedDelivery?: Date;
  }) {
    try {
      // Generate unique tracing ID
      const trackingNumber = `MP-${Math.floor(100000 + Math.random() * 900000)}`;

      const shipment = await prisma.shipment.create({
        data: {
          orderId: data.orderId,
          trackingNumber,
          carrier: data.carrier,
          origin: data.origin,
          destination: data.destination,
          status: 'BOOKED',
          estimatedDelivery: data.estimatedDelivery,
        },
      });

      logger.info(`Export shipment created: ${shipment.id}`);
      return shipment;
    } catch (error) {
      logger.error('Error in ExportService.createShipment:', error);
      throw error;
    }
  }

  /**
   * Upload an export document
   */
  public static async uploadExportDocument(data: {
    shipmentId: string;
    documentType: DocumentType;
    fileUrl: string;
  }) {
    try {
      const shipment = await prisma.shipment.findUnique({
        where: { id: data.shipmentId },
      });

      if (!shipment) {
        throw new NotFoundError('Shipment not found.');
      }

      const doc = await prisma.exportDocument.create({
        data: {
          shipmentId: data.shipmentId,
          documentType: data.documentType,
          fileUrl: data.fileUrl,
          status: 'PENDING',
        },
      });

      logger.info(`Export document ${data.documentType} uploaded for shipment ${data.shipmentId}`);
      return doc;
    } catch (error) {
      logger.error('Error in ExportService.uploadExportDocument:', error);
      throw error;
    }
  }

  /**
   * Update verification status of export document
   */
  public static async updateDocumentStatus(documentId: string, status: DocumentStatus, notes?: string) {
    try {
      const doc = await prisma.exportDocument.update({
        where: { id: documentId },
        data: { status, notes },
      });

      logger.info(`Export document ${documentId} status updated to ${status}`);
      return doc;
    } catch (error) {
      logger.error('Error in ExportService.updateDocumentStatus:', error);
      throw error;
    }
  }

  /**
   * Get shipment status and documents
   */
  public static async getShipmentDetails(shipmentId: string) {
    const shipment = await prisma.shipment.findUnique({
      where: { id: shipmentId },
      include: {
        order: {
          include: {
            buyer: { select: { email: true, profile: { select: { fullName: true } } } },
            seller: { select: { email: true, profile: { select: { fullName: true } } } },
          },
        },
        documents: true,
        logisticsBooking: true,
      },
    });

    if (!shipment) {
      throw new NotFoundError('Shipment not found.');
    }

    return shipment;
  }

  /**
   * List shipments
   */
  public static async listShipments(filter: { role?: string; userId?: string } = {}) {
    // If user is Seller, filter by orders created by them
    if (filter.role === 'FARMER') {
      return prisma.shipment.findMany({
        where: { order: { sellerId: filter.userId } },
        include: { documents: true, order: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    // If user is Buyer / Exporter
    if (filter.role === 'BUYER' || filter.role === 'EXPORTER') {
      return prisma.shipment.findMany({
        where: { order: { buyerId: filter.userId } },
        include: { documents: true, order: true },
        orderBy: { createdAt: 'desc' },
      });
    }

    // Admin lists all
    return prisma.shipment.findMany({
      include: { documents: true, order: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
