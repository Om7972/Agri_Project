import prisma from '@/config/db';
import { logger } from '@/utils/logger';
import { LogisticsStatus, ShipmentStatus } from '@prisma/client';
import { NotFoundError } from '@/utils/apiErrors';
import { Server } from 'socket.io';

export class LogisticsService {
  /**
   * Create a logistics booking / truck assignment
   */
  public static async createBooking(data: {
    driverName: string;
    driverPhone: string;
    vehicleNumber: string;
    vehicleType: string;
  }) {
    try {
      const booking = await prisma.logisticsBooking.create({
        data: {
          driverName: data.driverName,
          driverPhone: data.driverPhone,
          vehicleNumber: data.vehicleNumber,
          vehicleType: data.vehicleType,
          status: 'ASSIGNED',
        },
      });
      logger.info(`Logistics booking created: ${booking.id}`);
      return booking;
    } catch (error) {
      logger.error('Error in LogisticsService.createBooking:', error);
      throw error;
    }
  }

  /**
   * Assign a shipment to a booking
   */
  public static async assignShipmentToBooking(bookingId: string, shipmentId: string) {
    try {
      const booking = await prisma.logisticsBooking.findUnique({
        where: { id: bookingId },
      });
      if (!booking) {
        throw new NotFoundError('Logistics booking not found.');
      }

      const shipment = await prisma.shipment.update({
        where: { id: shipmentId },
        data: {
          logisticsBookingId: bookingId,
          status: 'IN_TRANSIT',
        },
      });

      logger.info(`Shipment ${shipmentId} assigned to logistics booking ${bookingId}`);
      return shipment;
    } catch (error) {
      logger.error('Error in LogisticsService.assignShipmentToBooking:', error);
      throw error;
    }
  }

  /**
   * Update delivery status
   */
  public static async updateStatus(bookingId: string, status: LogisticsStatus, io?: Server) {
    try {
      const booking = await prisma.logisticsBooking.update({
        where: { id: bookingId },
        data: { status },
        include: { shipments: true },
      });

      // Map logistics status to shipment status
      let shipmentStatus: ShipmentStatus = 'IN_TRANSIT';
      if (status === 'DISPATCHED') {
        shipmentStatus = 'IN_TRANSIT';
      } else if (status === 'DELIVERED') {
        shipmentStatus = 'DELIVERED';
      }

      // Update all associated shipments
      await prisma.shipment.updateMany({
        where: { logisticsBookingId: bookingId },
        data: {
          status: shipmentStatus,
          actualDelivery: status === 'DELIVERED' ? new Date() : undefined,
        },
      });

      // Emit real-time tracking status update
      if (io) {
        booking.shipments.forEach((shipment) => {
          io.to(`user:${shipment.orderId}`).emit('shipment_status_update', {
            shipmentId: shipment.id,
            status: shipmentStatus,
          });
        });
      }

      logger.info(`Logistics booking ${bookingId} status updated to ${status}`);
      return booking;
    } catch (error) {
      logger.error('Error in LogisticsService.updateStatus:', error);
      throw error;
    }
  }

  /**
   * Update real-time GPS coordinate of truck
   */
  public static async updateLocation(bookingId: string, lat: number, lng: number, io?: Server) {
    try {
      const booking = await prisma.logisticsBooking.update({
        where: { id: bookingId },
        data: {
          currentLatitude: lat,
          currentLongitude: lng,
        },
        include: { shipments: true },
      });

      // Broadcast new location to all clients tracking associated shipments
      if (io) {
        booking.shipments.forEach((shipment) => {
          io.to(`shipment:track:${shipment.id}`).emit('driver_location_update', {
            shipmentId: shipment.id,
            latitude: lat,
            longitude: lng,
          });
        });
      }

      return booking;
    } catch (error) {
      logger.error('Error in LogisticsService.updateLocation:', error);
      throw error;
    }
  }

  /**
   * Retrieve logistics details
   */
  public static async getBookingDetails(bookingId: string) {
    const booking = await prisma.logisticsBooking.findUnique({
      where: { id: bookingId },
      include: {
        shipments: {
          include: {
            order: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundError('Logistics booking not found.');
    }

    return booking;
  }

  /**
   * List all logistics bookings
   */
  public static async listBookings() {
    return prisma.logisticsBooking.findMany({
      include: {
        shipments: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
