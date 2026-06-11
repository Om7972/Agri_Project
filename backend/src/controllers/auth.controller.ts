import { Request, Response, NextFunction } from 'express';
import { AuthService } from '@/services/auth.service';
import { sendResponse } from '@/utils/responseHandlers';
import { registerSchema, loginSchema, tokenRefreshSchema } from '@/validators/auth';

export class AuthController {
  public static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.register(req.body);
      return sendResponse(res, 201, 'User registered successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return sendResponse(res, 200, 'Login successful.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      const result = await AuthService.refreshAccessToken(refreshToken);
      return sendResponse(res, 200, 'Access token refreshed successfully.', result);
    } catch (error) {
      next(error);
    }
  }

  public static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const { refreshToken } = req.body;
      await AuthService.logout(refreshToken);
      return sendResponse(res, 200, 'Logged out successfully.', null);
    } catch (error) {
      next(error);
    }
  }
}
