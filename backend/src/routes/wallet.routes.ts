import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '@/middlewares/auth';
import { WalletService } from '@/services/wallet.service';
import { sendResponse } from '@/utils/responseHandlers';

const router = Router();

router.get('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = await WalletService.getOrCreateWallet(req.user!.id);
    sendResponse(res, 200, 'Wallet fetched', wallet);
  } catch (e) { next(e); }
});

router.get('/balance', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const balance = await WalletService.getBalance(req.user!.id);
    sendResponse(res, 200, 'Balance fetched', balance);
  } catch (e) { next(e); }
});

router.get('/transactions', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const result = await WalletService.getTransactions(req.user!.id, page);
    sendResponse(res, 200, 'Transactions fetched', result);
  } catch (e) { next(e); }
});

router.post('/credit', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount, type, description } = req.body;
    const result = await WalletService.credit(req.user!.id, amount, type || 'CREDIT', description);
    sendResponse(res, 200, 'Wallet credited', result);
  } catch (e) { next(e); }
});

router.post('/withdraw', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { amount } = req.body;
    const result = await WalletService.withdraw(req.user!.id, amount);
    sendResponse(res, 200, 'Withdrawal processed', result);
  } catch (e) { next(e); }
});

export default router;
