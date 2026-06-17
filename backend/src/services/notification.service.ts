import nodemailer from 'nodemailer';
import twilio from 'twilio';
import prisma from '@/config/db';
import { logger } from '@/utils/logger';
import { NotificationType, Role, Notification } from '@prisma/client';
import { Server } from 'socket.io';

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

// Configure Twilio client (optional)
const twilioSid = process.env.TWILIO_ACCOUNT_SID || '';
const twilioToken = process.env.TWILIO_AUTH_TOKEN || '';
const twilioFrom = process.env.TWILIO_FROM_NUMBER || '';
const twilioClient = twilioSid && twilioToken ? twilio(twilioSid, twilioToken) : null;

export class NotificationService {
  /**
   * Send an Email Notification
   */
  public static async sendEmail(to: string, subject: string, htmlContent: string): Promise<boolean> {
    try {
      if (!process.env.SMTP_USER) {
        logger.info(`[MOCK EMAIL] To: ${to} | Subject: ${subject}`);
        return true;
      }

      await transporter.sendMail({
        from: `"MandiPrime Commodity Exchange" <${process.env.SMTP_FROM_EMAIL || 'noreply@mandiprime.com'}>`,
        to,
        subject,
        html: htmlContent,
      });

      logger.info(`Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send email to ${to}:`, error);
      return false;
    }
  }

  /**
   * Send an SMS Notification
   */
  public static async sendSMS(to: string, message: string): Promise<boolean> {
    try {
      if (!twilioClient) {
        logger.info(`[MOCK SMS] To: ${to} | Msg: ${message}`);
        return true;
      }

      await twilioClient.messages.create({
        body: message,
        from: twilioFrom,
        to,
      });

      logger.info(`SMS sent successfully to ${to}`);
      return true;
    } catch (error) {
      logger.error(`Failed to send SMS to ${to}:`, error);
      return false;
    }
  }

  /**
   * Dispatch an In-App Notification (and emit over WebSockets)
   */
  public static async sendInAppNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'INFO',
    io?: Server
  ): Promise<Notification | null> {
    try {
      const dbNotification = await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
        },
      });

      // If Socket.IO instance is available, emit event in real time
      if (io) {
        io.to(`user:${userId}`).emit('notification', dbNotification);
      }

      logger.info(`In-App Notification saved for user: ${userId}`);
      return dbNotification;
    } catch (error) {
      logger.error(`Failed to create in-app notification for user ${userId}:`, error);
      return null;
    }
  }

  /**
   * Broadcast in-app notification to all users with a specific role
   */
  public static async broadcastToRole(
    role: Role,
    title: string,
    message: string,
    type: NotificationType = 'INFO',
    io?: Server
  ): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        where: { role },
        select: { id: true },
      });

      for (const u of users) {
        await this.sendInAppNotification(u.id, title, message, type, io);
      }

      if (io) {
        io.to(`role:${role}`).emit('broadcast_notification', { title, message, type });
      }
    } catch (error) {
      logger.error(`Failed to broadcast notification to role ${role}:`, error);
    }
  }
}
