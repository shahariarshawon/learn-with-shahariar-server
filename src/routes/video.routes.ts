import { Router } from 'express';
import VideoController from '../controllers/video.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { verifyVideoAccess } from '../middleware/videoAuth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { watchProgressSchema } from '../validators/video.validator.js';

const videoRouter: Router = Router();

// Require authentication for all video routes
videoRouter.use(authenticateUser as any);

/**
 * GET /api/videos/continue
 * Retrieve continue watching state
 */
videoRouter.get('/continue', VideoController.getContinueWatching as any);

/**
 * GET /api/videos/:lessonId/access
 * Retrieve secure video access info
 */
videoRouter.get('/:lessonId/access', verifyVideoAccess as any, VideoController.getVideoAccess as any);

/**
 * POST /api/videos/progress
 * Track watch progress & sync completion
 */
videoRouter.post(
  '/progress',
  validateRequest(watchProgressSchema),
  verifyVideoAccess as any,
  VideoController.updateWatchProgress as any
);

export default videoRouter;
