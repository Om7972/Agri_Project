import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '@/middlewares/auth';
import { EscrowService } from '@/services/escrow.service';
import { sendResponse } from '@/utils/responseHandlers';

const router = Router();

router.post('/fund', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await EscrowService.fundEscrow(req.body.orderId, req.user!.id);
    sendResponse(res, 201, 'Escrow funded', result);
  } catch (e) { next(e); }
});

router.post('/release', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await EscrowService.releaseEscrow(req.body.orderId);
    sendResponse(res, 200, 'Escrow released', result);
  } catch (e) { next(e); }
});

router.post('/refund', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await EscrowService.refundEscrow(req.body.orderId);
    sendResponse(res, 200, 'Escrow refunded', result);
  } catch (e) { next(e); }
});

router.get('/:orderId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await EscrowService.getEscrowByOrder(req.params.orderId);
    sendResponse(res, 200, 'Escrow fetched', result);
  } catch (e) { next(e); }
});

export default router;
