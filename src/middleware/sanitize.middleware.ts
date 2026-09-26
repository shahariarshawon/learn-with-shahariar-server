import { Request, Response, NextFunction } from 'express';

/**
 * Sanitizes input objects to prevent MongoDB query operator injection ($gt, $ne, $where)
 */
const cleanInput = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanInput);
  }

  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    // Strip keys starting with $ or containing dots to prevent query injection
    if (key.startsWith('$') || key.includes('.')) {
      continue;
    }
    cleaned[key] = cleanInput(obj[key]);
  }
  return cleaned;
};

export const sanitizeInputs = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.body) {
    req.body = cleanInput(req.body);
  }
  if (req.query) {
    req.query = cleanInput(req.query);
  }
  if (req.params) {
    req.params = cleanInput(req.params);
  }
  next();
};

export default sanitizeInputs;
