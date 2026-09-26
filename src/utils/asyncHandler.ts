import { Response, NextFunction } from 'express';
import { AuthenticatedRequest, AsyncController } from '../types/express.types.js';

export const asyncHandler = (fn: AsyncController) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default asyncHandler;
