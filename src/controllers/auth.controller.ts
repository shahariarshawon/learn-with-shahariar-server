import { Response } from 'express';
import AuthService from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../types/express.types.js';

export const register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await AuthService.register(req.body);
  return ApiResponse.success(res, 'User registered successfully', result, 201);
});

export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await AuthService.login(req.body);
  return ApiResponse.success(res, 'Login successful', result, 200);
});

export const refreshToken = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { refreshToken: token } = req.body;
  const result = await AuthService.refresh(token);
  return ApiResponse.success(res, 'Tokens refreshed successfully', result, 200);
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  return ApiResponse.success(res, 'User profile retrieved', { user: req.user }, 200);
});

export const authController = {
  register,
  login,
  refreshToken,
  getMe,
};

export default authController;
