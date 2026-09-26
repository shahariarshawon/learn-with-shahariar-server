import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../utils/apiError.js';

export const validateCreateCourse = (req: Request, _res: Response, next: NextFunction): void => {
  const body = req.body.courseData ? JSON.parse(req.body.courseData) : req.body;
  const title = body.courseTitle || body.title;
  const price = body.coursePrice ?? body.price;

  if (!title) {
    return next(new ApiError(400, 'Course title is required'));
  }
  if (price === undefined || price === null || price < 0) {
    return next(new ApiError(400, 'Valid course price is required'));
  }
  next();
};

export const validateUpdateCourse = (req: Request, _res: Response, next: NextFunction): void => {
  const { coursePrice, price } = req.body;
  const p = coursePrice ?? price;
  if (p !== undefined && (typeof p !== 'number' || p < 0)) {
    return next(new ApiError(400, 'Course price must be a positive number'));
  }
  next();
};
