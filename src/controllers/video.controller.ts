import { Response } from 'express';
import { AuthenticatedRequest } from '../types/express.types.js';
import VideoService from '../services/video.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export class VideoController {
  /**
   * GET /api/videos/:lessonId/access
   * Secure video access information
   */
  static getVideoAccess = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.auth?.userId || req.user?._id;
      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized access', null, 401);
      }

      const videoAccessContext = (req as any).videoAccess;
      const data = await VideoService.getVideoAccessData(userId.toString(), videoAccessContext);

      return ApiResponse.success(res, 'Secure video access granted successfully', data);
    }
  );

  /**
   * POST /api/videos/progress
   * Updates student watch progress & syncs lesson completion with Enrollment
   */
  static updateWatchProgress = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.auth?.userId || req.user?._id;
      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized access', null, 401);
      }

      const { lessonId, watchTime, lastPosition, completed } = req.body;

      const progress = await VideoService.updateWatchProgress(userId.toString(), {
        lessonId,
        watchTime: Number(watchTime),
        lastPosition: Number(lastPosition),
        completed: Boolean(completed),
      });

      return ApiResponse.success(res, 'Watch progress updated successfully', progress);
    }
  );

  /**
   * GET /api/videos/continue
   * Retrieves last watched lesson & playback position for continue watching
   */
  static getContinueWatching = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const userId = req.auth?.userId || req.user?._id;
      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized access', null, 401);
      }

      const continueData = await VideoService.getContinueWatchingData(userId.toString());

      if (!continueData) {
        return ApiResponse.success(res, 'No active watch history found', null);
      }

      return ApiResponse.success(res, 'Continue watching data fetched successfully', continueData);
    }
  );
}

export default VideoController;
