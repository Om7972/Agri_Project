import prisma from '@/config/db';
import { NotFoundError } from '@/utils/apiErrors';

export class CrmService {
  // ---- Leads ----
  public static async createLead(ownerId: string, data: { contactName: string; contactEmail?: string; contactPhone?: string; company?: string; source?: string; value?: number }) {
    return prisma.crmLead.create({ data: { ownerId, ...data } });
  }

  public static async listLeads(ownerId: string, status?: string, stage?: string) {
    const where: any = { ownerId };
    if (status) where.status = status;
    if (stage) where.stage = stage;
    return prisma.crmLead.findMany({ where, orderBy: { updatedAt: 'desc' }, include: { notes: { take: 3, orderBy: { createdAt: 'desc' } }, followUps: { where: { completed: false }, take: 3 } } });
  }

  public static async updateLead(id: string, data: any) {
    return prisma.crmLead.update({ where: { id }, data });
  }

  public static async getPipeline(ownerId: string) {
    const leads = await prisma.crmLead.findMany({ where: { ownerId }, include: { _count: { select: { notes: true, followUps: true } } } });
    const stages = ['PROSPECTING', 'QUALIFICATION', 'PROPOSAL', 'NEGOTIATION', 'CLOSING', 'CLOSED_WON', 'CLOSED_LOST'];
    return stages.map(stage => ({ stage, leads: leads.filter(l => l.stage === stage), count: leads.filter(l => l.stage === stage).length, totalValue: leads.filter(l => l.stage === stage).reduce((sum, l) => sum + (l.value || 0), 0) }));
  }

  // ---- Notes ----
  public static async addNote(leadId: string, authorId: string, content: string) {
    const lead = await prisma.crmLead.findUnique({ where: { id: leadId } });
    if (!lead) throw new NotFoundError('Lead not found.');
    return prisma.crmNote.create({ data: { leadId, authorId, content } });
  }

  // ---- Follow-ups ----
  public static async addFollowUp(leadId: string, assigneeId: string, data: { title: string; description?: string; dueDate: string }) {
    return prisma.followUp.create({ data: { leadId, assigneeId, title: data.title, description: data.description, dueDate: new Date(data.dueDate) } });
  }

  public static async completeFollowUp(id: string) {
    return prisma.followUp.update({ where: { id }, data: { completed: true, completedAt: new Date() } });
  }

  public static async getUpcomingFollowUps(assigneeId: string) {
    return prisma.followUp.findMany({ where: { assigneeId, completed: false }, orderBy: { dueDate: 'asc' }, take: 20, include: { lead: { select: { contactName: true, company: true } } } });
  }
}
