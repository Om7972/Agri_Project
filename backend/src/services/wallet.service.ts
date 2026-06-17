import prisma from '@/config/db';
import { WalletTxnType } from '@prisma/client';
import { NotFoundError, BadRequestError } from '@/utils/apiErrors';

export class WalletService {
  public static async getOrCreateWallet(userId: string) {
    let wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId, balance: 0 },
        include: { transactions: { orderBy: { createdAt: 'desc' }, take: 20 } },
      });
    }
    return wallet;
  }

  public static async getBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return { balance: wallet.balance, currency: wallet.currency };
  }

  public static async credit(userId: string, amount: number, type: WalletTxnType, description?: string, referenceId?: string) {
    if (amount <= 0) throw new BadRequestError('Amount must be positive.');
    const wallet = await this.getOrCreateWallet(userId);
    const [updatedWallet, txn] = await prisma.$transaction([
      prisma.wallet.update({ where: { id: wallet.id }, data: { balance: { increment: amount } } }),
      prisma.walletTransaction.create({ data: { walletId: wallet.id, type, amount, description, referenceId } }),
    ]);
    return { wallet: updatedWallet, transaction: txn };
  }

  public static async debit(userId: string, amount: number, type: WalletTxnType, description?: string, referenceId?: string) {
    if (amount <= 0) throw new BadRequestError('Amount must be positive.');
    const wallet = await this.getOrCreateWallet(userId);
    if (wallet.balance < amount) throw new BadRequestError('Insufficient wallet balance.');
    const [updatedWallet, txn] = await prisma.$transaction([
      prisma.wallet.update({ where: { id: wallet.id }, data: { balance: { decrement: amount } } }),
      prisma.walletTransaction.create({ data: { walletId: wallet.id, type, amount: -amount, description, referenceId } }),
    ]);
    return { wallet: updatedWallet, transaction: txn };
  }

  public static async getTransactions(userId: string, page = 1, limit = 20) {
    const wallet = await this.getOrCreateWallet(userId);
    const [transactions, total] = await prisma.$transaction([
      prisma.walletTransaction.findMany({ where: { walletId: wallet.id }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
      prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
    ]);
    return { transactions, total, page, totalPages: Math.ceil(total / limit) };
  }

  public static async withdraw(userId: string, amount: number) {
    return this.debit(userId, amount, 'WITHDRAWAL', 'Wallet withdrawal request');
  }
}
