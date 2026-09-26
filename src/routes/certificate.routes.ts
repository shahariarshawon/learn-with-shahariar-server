import { Router } from 'express';
import CertificateController from '../controllers/certificate.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';

const certificateRouter: Router = Router();

/**
 * Public Verification API (No authentication required)
 * GET /api/certificate/verify/:id
 */
certificateRouter.get('/verify/:id', CertificateController.verifyCertificate);

/**
 * Certificate Generation API (Authentication required)
 * POST /api/certificate/generate/:courseId
 */
certificateRouter.post('/generate/:courseId', authenticateUser, CertificateController.generateCertificate);

export default certificateRouter;
