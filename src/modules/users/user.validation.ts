import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../utils/apiError.js';

export const validateUserRating = (req: Request, _res: Response, next: NextFunction): void => {
  const { courseId, rating } = req.body;
  if (!courseId) {
    return next(new ApiError(400, 'Course ID is required'));
  }
  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return next(new ApiError(400, 'Rating must be a number between 1 and 5'));
  }
  next();
};

export const validateCourseProgress = (req: Request, _res: Response, next: NextFunction): void => {
  const { courseId, lectureId } = req.body;
  if (!courseId || !lectureId) {
    return next(new ApiError(400, 'Both courseId and lectureId are required'));
  }
  next();
};
