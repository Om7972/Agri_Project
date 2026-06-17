import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '@/middlewares/auth';
import { authorize } from '@/middlewares/roles';
import { FeatureFlagService } from '@/services/featureFlag.service';
import { TenantService } from '@/services/tenant.service';
import { sendResponse } from '@/utils/responseHandlers';

const router = Router();

// ---- Feature Flags ----
router.get('/flags', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flags = await FeatureFlagService.listFlags();
    sendResponse(res, 200, 'Flags listed', flags);
  } catch (e) { next(e); }
});

router.post('/flags', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flag = await FeatureFlagService.createFlag(req.body);
    sendResponse(res, 201, 'Flag created', flag);
  } catch (e) { next(e); }
});

router.patch('/flags/:key', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flag = await FeatureFlagService.updateFlag(req.params.key, req.body);
    sendResponse(res, 200, 'Flag updated', flag);
  } catch (e) { next(e); }
});

router.post('/flags/:key/toggle', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const flag = await FeatureFlagService.toggleFlag(req.params.key);
    sendResponse(res, 200, 'Flag toggled', flag);
  } catch (e) { next(e); }
});

router.get('/flags/:key/check', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enabled = await FeatureFlagService.isEnabled(req.params.key, req.user!.role, req.query.region as any);
    sendResponse(res, 200, 'Flag checked', { key: req.params.key, enabled });
  } catch (e) { next(e); }
});

// ---- Tenant Config ----
router.get('/tenants', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const configs = await TenantService.listConfigs();
    sendResponse(res, 200, 'Tenant configs listed', configs);
  } catch (e) { next(e); }
});

router.get('/tenants/:region', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await TenantService.getConfig(req.params.region as any);
    sendResponse(res, 200, 'Config fetched', config);
  } catch (e) { next(e); }
});

router.put('/tenants/:region', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const config = await TenantService.upsertConfig(req.params.region as any, req.body);
    sendResponse(res, 200, 'Config updated', config);
  } catch (e) { next(e); }
});

// ---- Audit Logs ----
router.get('/audit-logs', authenticate, authorize('ADMIN'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { default: prisma } = await import('@/config/db');
    const page = parseInt(req.query.page as string) || 1;
    const limit = 50;
    const where: any = {};
    if (req.query.category) where.category = req.query.category;
    if (req.query.userId) where.userId = req.query.userId;
    const [logs, total] = await prisma.$transaction([
      prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit, include: { user: { select: { email: true, role: true } } } }),
      prisma.auditLog.count({ where }),
    ]);
    sendResponse(res, 200, 'Audit logs fetched', { logs, total, page, totalPages: Math.ceil(total / limit) });
  } catch (e) { next(e); }
});

export default router;
