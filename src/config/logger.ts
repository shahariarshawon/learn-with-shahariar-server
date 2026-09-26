import { Request, Response, NextFunction } from 'express';

export class Logger {
  private static formatTime(): string {
    return new Date().toISOString();
  }

  static info(message: string, meta?: any) {
    console.log(`[INFO] [${this.formatTime()}] ${message}`, meta ? JSON.stringify(meta) : '');
  }

  static warn(message: string, meta?: any) {
    console.warn(`[WARN] [${this.formatTime()}] ${message}`, meta ? JSON.stringify(meta) : '');
  }

  static error(message: string, meta?: any) {
    console.error(`[ERROR] [${this.formatTime()}] ${message}`, meta ? JSON.stringify(meta) : '');
  }

  static http(message: string) {
    console.log(`[HTTP] [${this.formatTime()}] ${message}`);
  }
}

/**
 * Express Middleware for Request Logging
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    Logger.http(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
};

export default Logger;
