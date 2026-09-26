import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { normalizeRole, ROLES } from '../constants/roles.js';
import { clerkClient } from '@clerk/express';

/**
 * Role-Based Access Control (RBAC) Middleware
 * @param allowedRoles - List of allowed roles (e.g., ROLES.INSTRUCTOR, ROLES.ADMIN)
 */
export const authorizeRole = (...allowedRoles: string[]): RequestHandler => {
  const normalizedAllowedRoles = allowedRoles.map((r) => normalizeRole(r));

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user && !req.auth?.userId) {
      ApiResponse.error(res, 'Unauthorized: Please authenticate first', null, 401);
      return;
    }

    const currentRole = normalizeRole(req.user?.role || req.auth?.role);

    if (!normalizedAllowedRoles.includes(currentRole)) {
      ApiResponse.error(
        res,
        `Forbidden: Role '${currentRole}' is not authorized to access this resource`,
        null,
        403
      );
      return;
    }

    next();
  };
};

/**
 * Backward compatibility middleware for legacy protectEducator
 */
export const protectEducator: RequestHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.auth?.userId || req.user?._id?.toString();

    if (!userId) {
      ApiResponse.error(res, 'Unauthorized: User not authenticated', null, 401);
      return;
    }

    // Check DB user first
    if (req.user) {
      const userRole = normalizeRole(req.user.role);
      if (userRole === ROLES.INSTRUCTOR || userRole === ROLES.ADMIN) {
        return next();
      }
      // If user is from our native DB and not instructor, deny immediately
      if (!userId.startsWith('user_')) {
        ApiResponse.error(res, 'Unauthorized Access! Educator privileges required.', null, 403);
        return;
      }
    }

    // Fallback to Clerk publicMetadata check for Clerk users
    try {
      const clerkUser = await (clerkClient.users as any).getUser(userId);
      const role = clerkUser?.publicMetadata?.role;

      if (role !== 'educator' && normalizeRole(role) !== ROLES.INSTRUCTOR) {
        ApiResponse.error(res, 'Unauthorized Access! Educator privileges required.', null, 403);
        return;
      }

      next();
    } catch (clerkErr) {
      ApiResponse.error(res, 'Unauthorized Access! Educator privileges required.', null, 403);
      return;
    }
  } catch (error: any) {
    ApiResponse.error(res, error?.message || 'Authorization failed', null, 403);
  }
};

export default authorizeRole;
