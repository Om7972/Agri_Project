import { z } from 'zod';

export const createAuctionSchema = z.object({
  title: z.string().min(3, { message: 'Title must be at least 3 characters long' }),
  description: z.string().min(10, { message: 'Description must be at least 10 characters long' }),
  cropType: z.string().min(1, { message: 'Crop type is required' }),
  startPrice: z.preprocess((val) => Number(val), z.number().positive({ message: 'Start price must be positive' })),
  reservePrice: z.preprocess((val) => Number(val), z.number().positive({ message: 'Reserve price must be positive' })),
  startTime: z.preprocess((val) => new Date(val as string), z.date().refine((date) => date >= new Date(), {
    message: 'Start time must be in the future',
  })),
  endTime: z.preprocess((val) => new Date(val as string), z.date()),
}).refine((data) => data.endTime > data.startTime, {
  message: 'End time must be after start time',
  path: ['endTime'],
});

export const placeBidSchema = z.object({
  bidAmount: z.preprocess((val) => Number(val), z.number().positive({ message: 'Bid amount must be positive' })),
});
