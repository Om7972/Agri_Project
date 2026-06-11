import { z } from 'zod';
import { OrderStatus, PaymentStatus } from '@prisma/client';

export const createOrderSchema = z.object({
  productId: z.string().uuid({ message: 'Invalid product UUID' }),
  quantity: z.preprocess((val) => Number(val), z.number().positive({ message: 'Quantity must be positive' })),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus, { errorMap: () => ({ message: 'Invalid order status' }) }).optional(),
  paymentStatus: z.nativeEnum(PaymentStatus, { errorMap: () => ({ message: 'Invalid payment status' }) }).optional(),
});
