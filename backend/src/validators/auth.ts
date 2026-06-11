import { z } from 'zod';
import { Role } from '@prisma/client';

export const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  role: z.nativeEnum(Role, { errorMap: () => ({ message: 'Invalid role' }) }),
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters long' }),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export const tokenRefreshSchema = z.object({
  refreshToken: z.string({ required_error: 'Refresh token is required' }),
});
