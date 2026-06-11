import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '@/utils/apiErrors';
import { Role } from '@prisma/client';

interface JwtPayload {
  id: string;
  email: string;
  role: Role;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Access token is missing or malformed.');
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_ACCESS_SECRET || 'jwt_access_secret_key_123';

    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      next(new UnauthorizedError('Access token has expired. Please refresh.'));
    } else {
      next(new UnauthorizedError('Invalid access token.'));
    }
  }
};
