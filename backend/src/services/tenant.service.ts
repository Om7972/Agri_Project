import prisma from '@/config/db';
import { TenantRegion } from '@prisma/client';

export class TenantService {
  public static async getConfig(region: TenantRegion) {
    return prisma.tenantConfig.findUnique({ where: { region } });
  }

  public static async listConfigs() {
    return prisma.tenantConfig.findMany();
  }

  public static async upsertConfig(region: TenantRegion, data: { currency: string; currencySymbol: string; taxRate?: number; timezone: string; supportEmail?: string; settings?: any }) {
    return prisma.tenantConfig.upsert({
      where: { region },
      update: data,
      create: { region, ...data },
    });
  }
}
