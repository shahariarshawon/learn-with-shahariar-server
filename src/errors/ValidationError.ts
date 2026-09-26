import { AppError } from './AppError.js';

export class ValidationError extends AppError {
  public readonly errors?: any;

  constructor(message: string = 'Validation Failed', errors?: any) {
    super(message, 400);
    this.errors = errors;
  }
}
