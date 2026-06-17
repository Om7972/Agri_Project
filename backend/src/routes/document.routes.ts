import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '@/middlewares/auth';
import { DocumentService } from '@/services/document.service';
import { sendResponse } from '@/utils/responseHandlers';

const router = Router();

router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await DocumentService.uploadDocument(req.user!.id, req.body);
    sendResponse(res, 201, 'Document uploaded', result);
  } catch (e) { next(e); }
});

router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await DocumentService.listDocuments(req.user!.id, req.query.type as any);
    sendResponse(res, 200, 'Documents listed', result);
  } catch (e) { next(e); }
});

router.get('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await DocumentService.getDocument(req.params.id);
    sendResponse(res, 200, 'Document fetched', result);
  } catch (e) { next(e); }
});

router.post('/:id/version', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await DocumentService.updateVersion(req.params.id, req.body.fileUrl, req.body.fileSize);
    sendResponse(res, 201, 'New version created', result);
  } catch (e) { next(e); }
});

router.get('/:id/history', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await DocumentService.getVersionHistory(req.params.id);
    sendResponse(res, 200, 'Version history fetched', result);
  } catch (e) { next(e); }
});

router.delete('/:id', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    await DocumentService.deleteDocument(req.params.id);
    sendResponse(res, 200, 'Document deleted', null);
  } catch (e) { next(e); }
});

export default router;
