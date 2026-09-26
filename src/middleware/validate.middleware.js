import { ApiResponse } from '../utils/apiResponse.js';

export const validateRequest = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync(req[source]);
      req[source] = parsed;
      next();
    } catch (error) {
      if (error.errors) {
        const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        return ApiResponse.error(res, `Validation error: ${errorMessages}`, error.errors, 400);
      }
      return ApiResponse.error(res, error.message || 'Validation failed', null, 400);
    }
  };
};

export default validateRequest;
