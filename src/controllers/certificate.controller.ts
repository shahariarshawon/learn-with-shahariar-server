import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../types/express.types.js';
import CertificateService from '../services/certificate.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class CertificateController {
  /**
   * POST /api/certificate/generate/:courseId
   * Generates course completion certificate
   */
  static generateCertificate = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const studentId = (req.auth?.userId || req.user?._id)?.toString();
    if (!studentId) {
      return ApiResponse.error(res, 'Unauthorized access', null, 401);
    }

    const courseId = String(req.params.courseId);
    const certificate = await CertificateService.generateCertificate(studentId, courseId);

    return ApiResponse.success(res, 'Certificate generated successfully', certificate);
  });

  /**
   * GET /api/certificate/verify/:id
   * Public API verifying certificate authenticity
   */
  static verifyCertificate = asyncHandler(async (req: Request, res: Response) => {
    const identifier = String(req.params.id);
    const result = await CertificateService.verifyCertificate(identifier);

    if (!result.isValid) {
      return ApiResponse.error(res, result.message || 'Invalid certificate', null, 404);
    }

    return ApiResponse.success(res, 'Certificate verified successfully', result);
  });
}

export default CertificateController;
