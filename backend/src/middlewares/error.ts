import { Request, Response, NextFunction } from 'express';
import { ApiError } from '@/utils/apiErrors';
import { logger } from '@/utils/logger';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Prisma unique constraint error
  if (err.code === 'P2002') {
    statusCode = 400;
    const fields = err.meta?.target ? (err.meta.target as string[]).join(', ') : 'field';
    message = `Duplicate resource value. A record already exists with that ${fields}.`;
  }

  // Prisma not found error
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Resource not found in database.';
  }

  // Log error stack for debugging
  logger.error(`${req.method} ${req.url} - Error: ${message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors.length > 0 ? { errors } : {}),
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
};
