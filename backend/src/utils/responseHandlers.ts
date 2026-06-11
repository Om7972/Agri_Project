import { Response } from 'express';

export class ApiResponse<T = any> {
  public statusCode: number;
  public success: boolean;
  public message: string;
  public data: T;
  public meta?: any;

  constructor(statusCode: number, message: string, data: T, meta?: any) {
    this.statusCode = statusCode;
    this.success = statusCode >= 200 && statusCode < 300;
    this.message = message;
    this.data = data;
    if (meta) {
      this.meta = meta;
    }
  }

  public send(res: Response): Response {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
      ...(this.meta ? { meta: this.meta } : {}),
    });
  }
}

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data: T,
  meta?: any
): Response => {
  return new ApiResponse(statusCode, message, data, meta).send(res);
};
