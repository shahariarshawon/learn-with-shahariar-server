import { ApiError } from './apiError.js';

/**
 * Error thrown when video content access is invalid or missing
 */
export class VideoAccessError extends ApiError {
  constructor(message: string = 'Video access failed', statusCode: number = 400) {
    super(statusCode, message);
    this.name = 'VideoAccessError';
  }
}

/**
 * Error thrown when a student is not enrolled in a course
 */
export class EnrollmentError extends ApiError {
  constructor(message: string = 'You are not enrolled in this course.', statusCode: number = 403) {
    super(statusCode, message);
    this.name = 'EnrollmentError';
  }
}

/**
 * Error thrown when user lacks required permission
 */
export class PermissionError extends ApiError {
  constructor(message: string = 'Forbidden: Insufficient permissions', statusCode: number = 403) {
    super(statusCode, message);
    this.name = 'PermissionError';
  }
}
