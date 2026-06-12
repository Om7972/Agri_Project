import { Request, Response, NextFunction } from 'express';
import { ExportService } from '@/services/export.service';
import { AuditLogger } from '@/utils/auditLogger';
import { DocumentType, DocumentStatus } from '@prisma/client';

export class ExportController {
  /**
   * Create shipment booking
   */
  public static async createShipment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { orderId, carrier, origin, destination, estimatedDelivery } = req.body;
      const shipment = await ExportService.createShipment({
        orderId,
        carrier,
        origin,
        destination,
        estimatedDelivery: estimatedDelivery ? new Date(estimatedDelivery) : undefined,
      });

      await AuditLogger.log({
        userId: req.user!.id,
        action: 'CREATE_SHIPMENT',
        details: `Shipment created for order ${orderId}`,
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Export shipment booked successfully.',
        data: shipment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload phytosanitary certificate / commercial invoice
   */
  public static async uploadDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { shipmentId, documentType, fileUrl } = req.body;
      const doc = await ExportService.uploadExportDocument({
        shipmentId,
        documentType: documentType as DocumentType,
        fileUrl,
      });

      await AuditLogger.log({
        userId: req.user!.id,
        action: 'UPLOAD_EXPORT_DOCUMENT',
        details: `Uploaded ${documentType} for shipment ${shipmentId}`,
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully.',
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin approves / rejects document
   */
  public static async verifyDocument(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const doc = await ExportService.updateDocumentStatus(id, status as DocumentStatus, notes);

      await AuditLogger.log({
        userId: req.user!.id,
        action: 'VERIFY_EXPORT_DOCUMENT',
        details: `Updated document ${id} status to ${status}`,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: `Document status updated to ${status}`,
        data: doc,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get shipment status and history
   */
  public static async getShipment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const shipment = await ExportService.getShipmentDetails(id);
      res.status(200).json({
        success: true,
        data: shipment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List export shipments
   */
  public static async listShipments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const shipments = await ExportService.listShipments({
        role: req.user!.role,
        userId: req.user!.id,
      });
      res.status(200).json({
        success: true,
        data: shipments,
      });
    } catch (error) {
      next(error);
    }
  }
}
