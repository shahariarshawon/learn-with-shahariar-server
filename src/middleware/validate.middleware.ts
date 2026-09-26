import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError, ZodIssue } from 'zod';
import { ApiResponse } from '../utils/apiResponse.js';

export const validateRequest = (
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const errorMessages = error.issues
          .map((issue: ZodIssue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ');
        return ApiResponse.error(res, `Validation error: ${errorMessages}`, error.issues, 400);
      }
      return ApiResponse.error(res, error.message || 'Validation failed', null, 400);
    }
  };
};

export default validateRequest;
