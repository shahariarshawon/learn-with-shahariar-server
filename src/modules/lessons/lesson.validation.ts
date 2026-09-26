import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../utils/apiError.js';

export const validateLesson = (req: Request, _res: Response, next: NextFunction): void => {
  const { title, videoUrl } = req.body;
  if (!title) {
    return next(new ApiError(400, 'Lesson title is required'));
  }
  if (!videoUrl) {
    return next(new ApiError(400, 'Lesson video URL is required'));
  }
  next();
};
