/**
 * Application Roles
 */
export const ROLES = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
};

// Backward-compatibility mapping for existing frontend / Clerk roles
export const ROLE_ALIASES = {
  educator: ROLES.INSTRUCTOR,
  instructor: ROLES.INSTRUCTOR,
  student: ROLES.STUDENT,
  admin: ROLES.ADMIN,
};

export const normalizeRole = (role) => {
  if (!role) return ROLES.STUDENT;
  const lower = String(role).toLowerCase().trim();
  return ROLE_ALIASES[lower] || ROLES.STUDENT;
};
