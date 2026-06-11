import { z } from 'zod';

export const pricePredictionSchema = z.object({
  crop: z.string().min(2, { message: 'Crop name is required.' }),
  quantity: z.preprocess((val) => Number(val), z.number().positive({ message: 'Quantity must be positive.' })),
  location: z.string().min(2, { message: 'Location is required.' }),
});

export const aiChatSchema = z.object({
  message: z.string().min(1, { message: 'Message content cannot be empty.' }),
});

export const chatSessionCreateSchema = z.object({
  title: z.string().optional(),
});
