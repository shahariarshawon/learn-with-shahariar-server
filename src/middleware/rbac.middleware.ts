import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiResponse } from '../utils/apiResponse.js';
import { normalizeRole, ROLES } from '../constants/roles.js';
import { clerkClient } from '@clerk/express';
import User from '../models/User.js';
import { env } from '../config/env.js';

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

    const adminEmail = (env.ADMIN_EMAIL || 'shahariarshawon.dev@gmail.com').toLowerCase();
    const educatorEmail = (env.ALLOWED_EDUCATOR_EMAIL || 'shahariarshawon.dev@gmail.com').toLowerCase();
    const userEmail = (req.user?.email || '').toLowerCase();

    // 1. Super Admin email bypass: unrestricted access to all resources
    if (userEmail === adminEmail || userEmail.startsWith('admin@')) {
      if (req.user) req.user.role = ROLES.ADMIN as any;
      if (req.auth) req.auth.role = ROLES.ADMIN;
      return next();
    }

    const currentRole = normalizeRole(req.user?.role || req.auth?.role);

    // 2. Admins always have access to instructor, educator, and admin resources
    if (currentRole === ROLES.ADMIN) {
      return next();
    }

    // 3. Educator email check for instructor-scoped routes
    if (
      (normalizedAllowedRoles.includes(ROLES.INSTRUCTOR) || allowedRoles.includes('educator')) &&
      userEmail === educatorEmail
    ) {
      if (req.user) req.user.role = ROLES.INSTRUCTOR as any;
      if (req.auth) req.auth.role = ROLES.INSTRUCTOR;
      return next();
    }

    // 4. Role list verification
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
 * Educator protection middleware (supports instructor, educator, and admin roles)
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

    const adminEmail = (env.ADMIN_EMAIL || 'shahariarshawon.dev@gmail.com').toLowerCase();
    const educatorEmail = (env.ALLOWED_EDUCATOR_EMAIL || 'shahariarshawon.dev@gmail.com').toLowerCase();
    const userEmail = (req.user?.email || '').toLowerCase();

    if (userEmail === adminEmail || userEmail === educatorEmail || userEmail.startsWith('admin@')) {
      return next();
    }

    // 1. Check DB user first from req.user
    if (req.user) {
      const userRole = normalizeRole(req.user.role);
      if (userRole === ROLES.INSTRUCTOR || userRole === ROLES.ADMIN) {
        return next();
      }
    }

    // 2. Fetch latest user from DB in case req.user in memory was stale
    const dbUser = await User.findById(userId);
    if (dbUser) {
      const dbRole = normalizeRole(dbUser.role);
      const dbEmail = (dbUser.email || '').toLowerCase();

      if (dbEmail === adminEmail || dbEmail === educatorEmail || dbEmail.startsWith('admin@')) {
        dbUser.role = (dbEmail === adminEmail || dbEmail.startsWith('admin@')) ? (ROLES.ADMIN as any) : (ROLES.INSTRUCTOR as any);
        await dbUser.save();
        req.user = dbUser;
        return next();
      }

      if (dbRole === ROLES.INSTRUCTOR || dbRole === ROLES.ADMIN) {
        req.user = dbUser;
        return next();
      }
    }

    // 3. Fallback to Clerk publicMetadata check for Clerk users
    try {
      const clerkUser = await (clerkClient.users as any).getUser(userId);
      const clerkRole = clerkUser?.publicMetadata?.role;
      const normalizedClerkRole = normalizeRole(clerkRole);

      if (
        clerkRole === 'educator' ||
        normalizedClerkRole === ROLES.INSTRUCTOR ||
        normalizedClerkRole === ROLES.ADMIN
      ) {
        // Upgrade/sync user role in DB to match Clerk
        if (dbUser && dbUser.role === ROLES.STUDENT) {
          const newRole = normalizedClerkRole === ROLES.ADMIN ? ROLES.ADMIN : ROLES.INSTRUCTOR;
          dbUser.role = newRole as any;
          await dbUser.save();
          req.user = dbUser;
        }
        return next();
      }
    } catch (clerkErr) {
      // Ignored - fallback error below
    }

    ApiResponse.error(res, 'Unauthorized Access! Educator or Admin privileges required.', null, 403);
  } catch (error: any) {
    ApiResponse.error(res, error?.message || 'Authorization failed', null, 403);
  }
};

export default authorizeRole;
