import prisma from '@/config/db';
import { logger } from '@/utils/logger';

export class AuditLogger {
  /**
   * Log an event to the AuditLog database model
   */
  public static async log(data: {
    userId: string;
    action: string;
    details?: string;
    ipAddress?: string;
  }) {
    try {
      const logEntry = await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          details: data.details,
          ipAddress: data.ipAddress,
        },
      });
      return logEntry;
    } catch (error) {
      // Never block application execution if audit logging fails
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Failed to write audit log entry:', message);
      return null;
    }
  }
}
