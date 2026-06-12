import { Request, Response, NextFunction } from 'express';
import { LogisticsService } from '@/services/logistics.service';
import { AuditLogger } from '@/utils/auditLogger';
import { LogisticsStatus } from '@prisma/client';

export class LogisticsController {
  /**
   * Book a truck and register driver info
   */
  public static async createBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { driverName, driverPhone, vehicleNumber, vehicleType } = req.body;
      const booking = await LogisticsService.createBooking({
        driverName,
        driverPhone,
        vehicleNumber,
        vehicleType,
      });

      await AuditLogger.log({
        userId: req.user!.id,
        action: 'CREATE_LOGISTICS_BOOKING',
        details: `Logistics booking created: ${booking.id}`,
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        message: 'Logistics booking created successfully.',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Assign shipment to a specific driver/truck
   */
  public static async assignShipment(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { bookingId, shipmentId } = req.body;
      const shipment = await LogisticsService.assignShipmentToBooking(bookingId, shipmentId);

      await AuditLogger.log({
        userId: req.user!.id,
        action: 'ASSIGN_SHIPMENT_LOGISTICS',
        details: `Shipment ${shipmentId} assigned to booking ${bookingId}`,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Shipment successfully assigned to logistics node.',
        data: shipment,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update status of truck delivery
   */
  public static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const io = req.app.get('io'); // Fetch global Socket.IO server

      const booking = await LogisticsService.updateStatus(id, status as LogisticsStatus, io);

      await AuditLogger.log({
        userId: req.user!.id,
        action: 'UPDATE_LOGISTICS_STATUS',
        details: `Logistics booking ${id} status set to ${status}`,
        ipAddress: req.ip,
      });

      res.status(200).json({
        success: true,
        message: 'Logistics status updated.',
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update real-time GPS coordinate
   */
  public static async updateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { latitude, longitude } = req.body;
      const io = req.app.get('io');

      const booking = await LogisticsService.updateLocation(id, parseFloat(latitude), parseFloat(longitude), io);

      res.status(200).json({
        success: true,
        message: 'Driver location telemetry received and broadcasted.',
        data: {
          id: booking.id,
          currentLatitude: booking.currentLatitude,
          currentLongitude: booking.currentLongitude,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieve single logistics node details
   */
  public static async getBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const booking = await LogisticsService.getBookingDetails(id);
      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List logistics bookings
   */
  public static async listBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bookings = await LogisticsService.listBookings();
      res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      next(error);
    }
  }
}
