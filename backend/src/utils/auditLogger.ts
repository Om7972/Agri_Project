import prisma from '@/config/db';
import { AuditCategory } from '@prisma/client';
import { logger } from '@/utils/logger';

export class AuditLogger {
  public static async log(data: {
    userId: string;
    action: string;
    category?: AuditCategory;
    resource?: string;
    resourceId?: string;
    details?: string;
    metadata?: any;
    ipAddress?: string;
    userAgent?: string;
  }) {
    try {
      const logEntry = await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          category: data.category || 'USER_ACTION',
          resource: data.resource,
          resourceId: data.resourceId,
          details: data.details,
          metadata: data.metadata,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
        },
      });
      return logEntry;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Failed to write audit log entry:', message);
      return null;
    }
  }
}
