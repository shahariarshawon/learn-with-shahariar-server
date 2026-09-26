import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: System Health Check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server and database health status
 */
router.get('/', async (_req: Request, res: Response) => {
  const dbStatusMap: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const dbState = mongoose.connection.readyState;
  const isDbHealthy = dbState === 1;

  const healthData = {
    status: isDbHealthy ? 'UP' : 'DEGRADED',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: {
      status: dbStatusMap[dbState] || 'unknown',
      connected: isDbHealthy,
    },
    memoryUsage: process.memoryUsage(),
  };

  const statusCode = isDbHealthy ? 200 : 503;
  return ApiResponse.success(res, 'Server health check status retrieved', healthData, statusCode);
});

export default router;
