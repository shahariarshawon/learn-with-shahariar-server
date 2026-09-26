import { Router } from 'express';
import VideoController from '../controllers/video.controller.js';
import { authenticateUser } from '../middleware/auth.middleware.js';
import { verifyVideoAccess } from '../middleware/videoAuth.middleware.js';
import { validateRequest } from '../middleware/validate.middleware.js';
import { watchProgressSchema } from '../validators/video.validator.js';

const videoRouter: Router = Router();

// Require authentication for all video routes
videoRouter.use(authenticateUser);

/**
 * GET /api/videos/continue
 * Retrieve continue watching state
 */
videoRouter.get('/continue', VideoController.getContinueWatching);

/**
 * GET /api/videos/:lessonId/access
 * Retrieve secure video access info
 */
videoRouter.get('/:lessonId/access', verifyVideoAccess, VideoController.getVideoAccess);

/**
 * POST /api/videos/progress
 * Track watch progress & sync completion
 */
videoRouter.post(
  '/progress',
  validateRequest(watchProgressSchema),
  verifyVideoAccess,
  VideoController.updateWatchProgress
);

export default videoRouter;
