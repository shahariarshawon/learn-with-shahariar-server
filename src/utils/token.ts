import jwt, { Secret } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AuthTokenPayload } from '../types/express.types.js';

export const generateAccessToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, env.JWT_SECRET as Secret, {
    expiresIn: (env.JWT_EXPIRES_IN || '7d') as any,
  });
};

export const generateRefreshToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET as Secret, {
    expiresIn: (env.JWT_REFRESH_EXPIRES_IN || '30d') as any,
  });
};

export const verifyAccessToken = (token: string): AuthTokenPayload | null => {
  try {
    return jwt.verify(token, env.JWT_SECRET as Secret) as AuthTokenPayload;
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token: string): AuthTokenPayload | null => {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET as Secret) as AuthTokenPayload;
  } catch (error) {
    return null;
  }
};
