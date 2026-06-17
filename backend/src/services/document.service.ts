import prisma from '@/config/db';
import { DocCenterType } from '@prisma/client';
import { NotFoundError } from '@/utils/apiErrors';

export class DocumentService {
  public static async uploadDocument(ownerId: string, data: { type: DocCenterType; title: string; fileUrl: string; fileSize?: number; mimeType?: string; metadata?: any }) {
    return prisma.document.create({ data: { ownerId, ...data } });
  }

  public static async listDocuments(ownerId: string, type?: DocCenterType) {
    const where: any = { ownerId };
    if (type) where.type = type;
    return prisma.document.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  public static async getDocument(id: string) {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundError('Document not found.');
    return doc;
  }

  public static async updateVersion(id: string, fileUrl: string, fileSize?: number) {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundError('Document not found.');
    // Create new version, archive old
    return prisma.document.create({ data: { ownerId: doc.ownerId, type: doc.type, title: doc.title, fileUrl, fileSize, mimeType: doc.mimeType, version: doc.version + 1, parentId: doc.id, metadata: doc.metadata ?? undefined } });
  }

  public static async getVersionHistory(id: string) {
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) throw new NotFoundError('Document not found.');
    const rootId = doc.parentId || doc.id;
    return prisma.document.findMany({ where: { OR: [{ id: rootId }, { parentId: rootId }] }, orderBy: { version: 'desc' } });
  }

  public static async deleteDocument(id: string) {
    return prisma.document.delete({ where: { id } });
  }
}
