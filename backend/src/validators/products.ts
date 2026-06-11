import { z } from 'zod';

export const createProductSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters' }),
  price: z.preprocess((val) => Number(val), z.number().positive({ message: 'Price must be positive' })),
  unit: z.string().min(1, { message: 'Unit is required (e.g. Ton, Quintal)' }),
  stock: z.preprocess((val) => Number(val), z.number().nonnegative({ message: 'Stock cannot be negative' })),
  cropType: z.string().min(1, { message: 'Crop type is required' }),
  grade: z.string().min(1, { message: 'Grade is required' }),
  categoryId: z.string().uuid({ message: 'Invalid category UUID' }),
  imageUrl: z.string().url().optional(),
  sellerVerification: z.enum(['Standard', 'Elite']).optional().default('Standard'),
});

export const updateProductSchema = createProductSchema.partial();
