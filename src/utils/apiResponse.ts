import { Response } from 'express';

export class ApiResponse {
  static success<T = any>(
    res: Response,
    message: string = 'Success',
    data: T = {} as T,
    statusCode: number = 200
  ): Response {
    const payload: Record<string, any> = {
      success: true,
      message,
      data,
    };

    // Spread top-level keys if data is an object (for backward compatibility with legacy frontend)
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      for (const [key, value] of Object.entries(data)) {
        if (!(key in payload)) {
          payload[key] = value;
        }
      }
    }

    return res.status(statusCode).json(payload);
  }

  static error(
    res: Response,
    message: string = 'Internal Server Error',
    error: any = null,
    statusCode: number = 500
  ): Response {
    return res.status(statusCode).json({
      success: false,
      message,
      error: error || message,
    });
  }
}

export default ApiResponse;
