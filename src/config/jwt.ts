import { env } from './env.js';

export const jwtConfig = {
  secret: env.JWT_SECRET || 'fallback_secret_key',
  expiresIn: env.JWT_EXPIRES_IN || '7d',
  refreshSecret: env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
  refreshExpiresIn: env.JWT_REFRESH_EXPIRES_IN || '30d',
};
