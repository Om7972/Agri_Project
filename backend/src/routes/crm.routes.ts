import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '@/middlewares/auth';
import { CrmService } from '@/services/crm.service';
import { sendResponse } from '@/utils/responseHandlers';

const router = Router();

router.post('/leads', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CrmService.createLead(req.user!.id, req.body);
    sendResponse(res, 201, 'Lead created', result);
  } catch (e) { next(e); }
});

router.get('/leads', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CrmService.listLeads(req.user!.id, req.query.status as string, req.query.stage as string);
    sendResponse(res, 200, 'Leads fetched', result);
  } catch (e) { next(e); }
});

router.patch('/leads/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CrmService.updateLead(req.params.id, req.body);
    sendResponse(res, 200, 'Lead updated', result);
  } catch (e) { next(e); }
});

router.get('/pipeline', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CrmService.getPipeline(req.user!.id);
    sendResponse(res, 200, 'Pipeline fetched', result);
  } catch (e) { next(e); }
});

router.post('/leads/:id/notes', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CrmService.addNote(req.params.id, req.user!.id, req.body.content);
    sendResponse(res, 201, 'Note added', result);
  } catch (e) { next(e); }
});

router.post('/leads/:id/followups', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CrmService.addFollowUp(req.params.id, req.user!.id, req.body);
    sendResponse(res, 201, 'Follow-up added', result);
  } catch (e) { next(e); }
});

router.patch('/followups/:id/complete', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CrmService.completeFollowUp(req.params.id);
    sendResponse(res, 200, 'Follow-up completed', result);
  } catch (e) { next(e); }
});

router.get('/followups/upcoming', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await CrmService.getUpcomingFollowUps(req.user!.id);
    sendResponse(res, 200, 'Follow-ups fetched', result);
  } catch (e) { next(e); }
});

export default router;
