import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { verifyAccessToken } from '../utils/token.js';
import User from '../models/User.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { clerkClient } from '@clerk/express';
import { normalizeRole, ROLES } from '../constants/roles.js';
import { AuthenticatedRequest } from '../types/express.types.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

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
      
      try {
        const decoded = verifyAccessToken(token);
        if (decoded && (decoded.id || (decoded as any).userId)) {
          userId = decoded.id || (decoded as any).userId;
          authType = 'jwt';
        }
      } catch (err) {
        // Ignored - fallback to decoding Clerk JWT
      }

      // If not a native JWT, try decoding Clerk JWT payload
      if (!userId && token) {
        try {
          const clerkDecoded = jwt.decode(token) as any;
          if (clerkDecoded && (clerkDecoded.sub || clerkDecoded.userId || clerkDecoded.id)) {
            userId = clerkDecoded.sub || clerkDecoded.userId || clerkDecoded.id;
            authType = 'clerk';
          }
        } catch (clerkDecodeErr) {
          // Ignored
        }
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

    const adminEmail = (env.ADMIN_EMAIL || 'shahariarshawon.dev@gmail.com').toLowerCase();
    const educatorEmail = (env.ALLOWED_EDUCATOR_EMAIL || 'shahariarshawon.dev@gmail.com').toLowerCase();

    // If user not in DB yet, auto-provision user profile
    if (!user) {
      try {
        let name = 'User';
        let email = '';
        let imageUrl = '';
        let role: any = ROLES.STUDENT;

        try {
          const clerkUser = await (clerkClient.users as any).getUser(userId);
          const firstName = clerkUser?.firstName || '';
          const lastName = clerkUser?.lastName || '';
          name = `${firstName} ${lastName}`.trim() || clerkUser?.username || 'User';
          email =
            clerkUser?.primaryEmailAddress?.emailAddress ||
            clerkUser?.emailAddresses?.[0]?.emailAddress ||
            '';
          imageUrl = clerkUser?.imageUrl || '';
          const clerkRole = clerkUser?.publicMetadata?.role;
          if (clerkRole) {
            role = normalizeRole(clerkRole) as any;
          }
        } catch (clerkFetchErr: any) {
          logger.warn(`[AuthMiddleware] Clerk API user fetch warning: ${clerkFetchErr.message}`);
        }

        const lowerEmail = email.toLowerCase();
        if (lowerEmail === adminEmail || lowerEmail.startsWith('admin@')) {
          role = ROLES.ADMIN;
        } else if (lowerEmail === educatorEmail) {
          role = ROLES.INSTRUCTOR;
        }

        user = await User.create({
          _id: userId,
          name,
          email: email || `${userId}@user.com`,
          imageUrl,
          profileImage: imageUrl,
          role,
          enrolledCourses: [],
        });
      } catch (createErr: any) {
        logger.error(`[AuthMiddleware] Auto user creation error: ${createErr.message}`);
        user = await User.findById(userId);
      }
    } else {
      // Existing user: check if role needs automatic upgrade or sync
      const userEmail = (user.email || '').toLowerCase();
      let roleNeedsUpdate = false;
      let targetRole = user.role;

      if (userEmail === adminEmail || userEmail.startsWith('admin@')) {
        if (user.role !== ROLES.ADMIN) {
          targetRole = ROLES.ADMIN;
          roleNeedsUpdate = true;
        }
      } else if (userEmail === educatorEmail) {
        if (user.role !== ROLES.INSTRUCTOR && user.role !== ROLES.ADMIN) {
          targetRole = ROLES.INSTRUCTOR;
          roleNeedsUpdate = true;
        }
      }

      if (!roleNeedsUpdate && user.role === ROLES.STUDENT) {
        try {
          const clerkUser = await (clerkClient.users as any).getUser(userId);
          const clerkRole = clerkUser?.publicMetadata?.role;
          if (clerkRole) {
            const normalized = normalizeRole(clerkRole);
            if (normalized !== ROLES.STUDENT) {
              targetRole = normalized as any;
              roleNeedsUpdate = true;
            }
          }
        } catch {
          // Non-critical if Clerk offline
        }
      }

      if (roleNeedsUpdate) {
        user.role = targetRole as any;
        await User.findByIdAndUpdate(user._id, { role: targetRole });
        logger.info(`[AuthMiddleware] User ${user.email} role synchronized to ${targetRole}`);
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
    logger.error(`[AuthMiddleware Error]: ${error.message}`);
    return ApiResponse.error(res, 'Authentication failed', error.message, 401);
  }
};

export const requireAuth = authenticateUser;

/**
 * Optional Authentication (does not block if unauthenticated)
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
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
