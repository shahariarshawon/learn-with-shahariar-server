import { Response, NextFunction } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { normalizeRole, ROLES } from '../constants/roles.js';
import { clerkClient } from '@clerk/express';
import { AuthenticatedRequest } from '../types/express.types.js';

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param allowedRoles - List of allowed roles (e.g., ROLES.INSTRUCTOR, ROLES.ADMIN)
 */
export const authorizeRole = (...allowedRoles: string[]) => {
  const normalizedAllowedRoles = allowedRoles.map((r) => normalizeRole(r));

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): any => {
    if (!req.user && !req.auth?.userId) {
      return ApiResponse.error(res, 'Unauthorized: Please authenticate first', null, 401);
    }

    const currentRole = normalizeRole(req.user?.role || req.auth?.role);

    if (!normalizedAllowedRoles.includes(currentRole)) {
      return ApiResponse.error(
        res,
        `Forbidden: Role '${currentRole}' is not authorized to access this resource`,
        null,
        403
      );
    }

    next();
  };
};

/**
 * Backward compatibility middleware for legacy protectEducator
 */
export const protectEducator = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const userId = req.auth?.userId || req.user?._id;

    if (!userId) {
      return ApiResponse.error(res, 'Unauthorized: User not authenticated', null, 401);
    }

    // Check DB user first
    if (req.user) {
      const userRole = normalizeRole(req.user.role);
      if (userRole === ROLES.INSTRUCTOR || userRole === ROLES.ADMIN) {
        return next();
      }
      // If user is from our native DB and not instructor, deny immediately
      if (!userId.startsWith('user_')) {
        return ApiResponse.error(res, 'Unauthorized Access! Educator privileges required.', null, 403);
      }
    }

    // Fallback to Clerk publicMetadata check for Clerk users
    try {
      const clerkUser = await (clerkClient.users as any).getUser(userId);
      const role = clerkUser?.publicMetadata?.role;

      if (role !== 'educator' && normalizeRole(role) !== ROLES.INSTRUCTOR) {
        return ApiResponse.error(res, 'Unauthorized Access! Educator privileges required.', null, 403);
      }

      next();
    } catch (clerkErr) {
      return ApiResponse.error(res, 'Unauthorized Access! Educator privileges required.', null, 403);
    }
  } catch (error: any) {
    return ApiResponse.error(res, error.message || 'Authorization failed', null, 403);
  }
};

export default authorizeRole;
