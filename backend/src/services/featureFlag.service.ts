import prisma from '@/config/db';
import { Role, TenantRegion } from '@prisma/client';

export class FeatureFlagService {
  public static async listFlags() {
    return prisma.featureFlag.findMany({ orderBy: { key: 'asc' } });
  }

  public static async getFlag(key: string) {
    return prisma.featureFlag.findUnique({ where: { key } });
  }

  public static async isEnabled(key: string, userRole?: Role, region?: TenantRegion): Promise<boolean> {
    const flag = await prisma.featureFlag.findUnique({ where: { key } });
    if (!flag || !flag.enabled) return false;
    if (flag.roles.length > 0 && userRole && !flag.roles.includes(userRole)) return false;
    if (flag.regions.length > 0 && region && !flag.regions.includes(region)) return false;
    if (flag.percentage < 100) return Math.random() * 100 < flag.percentage;
    return true;
  }

  public static async createFlag(data: { key: string; name: string; description?: string; enabled?: boolean; percentage?: number; roles?: string[]; regions?: string[]; metadata?: any }) {
    return prisma.featureFlag.create({ data: { key: data.key, name: data.name, description: data.description, enabled: data.enabled ?? false, percentage: data.percentage ?? 100, roles: data.roles ?? [], regions: data.regions ?? [], metadata: data.metadata } });
  }

  public static async updateFlag(key: string, data: any) {
    return prisma.featureFlag.update({ where: { key }, data });
  }

  public static async toggleFlag(key: string) {
    const flag = await prisma.featureFlag.findUnique({ where: { key } });
    if (!flag) return null;
    return prisma.featureFlag.update({ where: { key }, data: { enabled: !flag.enabled } });
  }

  public static async deleteFlag(key: string) {
    return prisma.featureFlag.delete({ where: { key } });
  }
}
