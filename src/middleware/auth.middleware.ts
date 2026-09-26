import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.js';
import User from '../models/User.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { clerkClient } from '@clerk/express';
import { normalizeRole } from '../constants/roles.js';
import { AuthenticatedRequest } from '../types/express.types.js';

/**
 * Unified Authentication Middleware
 * Supports both Native JWT tokens and Clerk Authentication
 */
export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    let userId: string | null = null;
    let authType: 'jwt' | 'clerk' | null = null;

    // 1. Check for Bearer token
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);

      if (decoded && decoded.id) {
        userId = decoded.id;
        authType = 'jwt';
      }
    }

    // 2. Fallback to Clerk middleware session (req.auth)
    const clerkAuth = (req as any).auth;
    if (!userId && clerkAuth && clerkAuth.userId) {
      userId = clerkAuth.userId;
      authType = 'clerk';
    }

    // If no credentials found
    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized: Access token is missing or invalid', null, 401);
    }

    // Find user in database
    let user = await User.findById(userId);

    // If authenticated via Clerk but user not in DB yet, auto-provision
    if (!user && authType === 'clerk') {
      try {
        const clerkUser = await (clerkClient.users as any).getUser(userId);
        const firstName = clerkUser?.firstName || '';
        const lastName = clerkUser?.lastName || '';
        const name = `${firstName} ${lastName}`.trim() || clerkUser?.username || 'User';
        const email =
          clerkUser?.primaryEmailAddress?.emailAddress ||
          clerkUser?.emailAddresses?.[0]?.emailAddress ||
          '';
        const clerkRole = clerkUser?.publicMetadata?.role;
        const role = normalizeRole(clerkRole);

        user = await User.create({
          _id: userId,
          name,
          email,
          imageUrl: clerkUser?.imageUrl || '',
          profileImage: clerkUser?.imageUrl || '',
          role,
          enrolledCourses: [],
        });
      } catch (clerkErr: any) {
        console.error('[AuthMiddleware] Clerk user sync failed:', clerkErr.message);
      }
    }

    if (!user) {
      return ApiResponse.error(res, 'User not found in system', null, 404);
    }

    // Attach user and standardized auth object to request
    req.user = user;
    if (!req.auth) {
      req.auth = { userId: user._id.toString() };
    }
    req.auth.userId = user._id.toString();
    req.auth.role = normalizeRole(user.role);

    next();
  } catch (error: any) {
    console.error('[AuthMiddleware Error]:', error);
    return ApiResponse.error(res, 'Authentication failed', error.message, 401);
  }
};

/**
 * Optional Authentication (does not block if unauthenticated)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    let userId: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      if (decoded && decoded.id) {
        userId = decoded.id;
      }
    } else {
      const clerkAuth = (req as any).auth;
      if (clerkAuth && clerkAuth.userId) {
        userId = clerkAuth.userId;
      }
    }

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        req.user = user;
        if (!req.auth) req.auth = { userId: user._id.toString() };
        req.auth.userId = user._id.toString();
        req.auth.role = normalizeRole(user.role);
      }
    }
  } catch (err) {
    // Ignore error in optional auth
  }
  next();
};

export default authenticateUser;
