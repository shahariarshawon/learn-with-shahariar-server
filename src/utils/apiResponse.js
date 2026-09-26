/**
 * Standardized API Response Formatter
 * Complies with LMS specification while preserving backward compatibility.
 */
export class ApiResponse {
  static success(res, message = 'Success', data = {}, statusCode = 200) {
    const payload = {
      success: true,
      message,
      data,
    };

    // Spread top-level keys if data is an object (for backward compatibility with legacy frontend)
    if (data && typeof data === 'object' && !Array.isArray(data)) {
      for (const [key, value] of Object.entries(data)) {
        if (!(key in payload)) {
          payload[key] = value;
        }
      }
    }

    return res.status(statusCode).json(payload);
  }

  static error(res, message = 'Internal Server Error', error = null, statusCode = 500) {
    return res.status(statusCode).json({
      success: false,
      message,
      error: error || message,
    });
  }
}

export default ApiResponse;
