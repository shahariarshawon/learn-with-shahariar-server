import { Request, Response, NextFunction } from 'express';
import { IUserDocument } from './user.types.js';

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: string;
}

export interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
  auth?: {
    userId: string;
    role?: string;
  };
}

export type AsyncController = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => Promise<any>;
