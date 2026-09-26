import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { AppError } from '../errors/AppError.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`);
  next(error);
};

export const errorHandler = (
  err: ApiError | AppError | Error | any,
  req: Request,
  res: Response,
  _next: NextFunction
): Response => {
  let statusCode = 500;
  if (err instanceof AppError || err instanceof ApiError) {
    statusCode = err.statusCode;
  } else if (err.statusCode) {
    statusCode = err.statusCode;
  } else if (res.statusCode && res.statusCode !== 200) {
    statusCode = res.statusCode;
  }

  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
  }

  // Handle Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value entered for ${field}. Please use another value.`;
  }

  // Handle Mongoose ValidationError
  if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(', ');
  }

  // Log server errors using Winston logger
  if (statusCode >= 500) {
    logger.error(`[Server Error] [${req.method} ${req.url}]: ${err.message}`, { stack: err.stack });
  } else if (env.NODE_ENV === 'development') {
    logger.warn(`[Client Error] [${req.method} ${req.url}] (${statusCode}): ${message}`);
  }

  return ApiResponse.error(res, message, errors, statusCode);
};

export default errorHandler;
