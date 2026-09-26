/**
 * Application Roles
 */
export const ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
} as const;

export type AppRole = typeof ROLES[keyof typeof ROLES];

// Backward-compatibility mapping for existing frontend / Clerk roles
export const ROLE_ALIASES: Record<string, string> = {
  educator: ROLES.INSTRUCTOR,
  instructor: ROLES.INSTRUCTOR,
  student: ROLES.STUDENT,
  admin: ROLES.ADMIN,
};

export const normalizeRole = (role?: string | null): string => {
  if (!role) return ROLES.STUDENT;
  const lower = String(role).toLowerCase().trim();
  return ROLE_ALIASES[lower] || ROLES.STUDENT;
};
