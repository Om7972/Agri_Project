import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '@/middlewares/auth';
import { DisputeService } from '@/services/dispute.service';
import { sendResponse } from '@/utils/responseHandlers';

const router = Router();

router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await DisputeService.openDispute({ ...req.body, openedById: req.user!.id });
    sendResponse(res, 201, 'Dispute opened', result);
  } catch (e) { next(e); }
});

router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await DisputeService.listDisputes(req.user!.id, req.query.status as any);
    sendResponse(res, 200, 'Disputes listed', result);
  } catch (e) { next(e); }
});

router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await DisputeService.getDispute(req.params.id);
    sendResponse(res, 200, 'Dispute fetched', result);
  } catch (e) { next(e); }
});

router.post('/:id/messages', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await DisputeService.addMessage(req.params.id, req.user!.id, req.body.content, req.body.isMediator);
    sendResponse(res, 201, 'Message added', result);
  } catch (e) { next(e); }
});

router.post('/:id/evidence', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await DisputeService.uploadEvidence(req.params.id, req.user!.id, req.body.fileUrl, req.body.fileType, req.body.notes);
    sendResponse(res, 201, 'Evidence uploaded', result);
  } catch (e) { next(e); }
});

router.patch('/:id/status', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await DisputeService.updateStatus(req.params.id, req.body.status, req.body.mediatorNote);
    sendResponse(res, 200, 'Status updated', result);
  } catch (e) { next(e); }
});

export default router;
