import AuthService from '../services/auth.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const register = asyncHandler(async (req, res) => {
  const result = await AuthService.register(req.body);
  return ApiResponse.success(res, 'User registered successfully', result, 201);
});

export const login = asyncHandler(async (req, res) => {
  const result = await AuthService.login(req.body);
  return ApiResponse.success(res, 'Login successful', result, 200);
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;
  const result = await AuthService.refresh(token);
  return ApiResponse.success(res, 'Tokens refreshed successfully', result, 200);
});

export const getMe = asyncHandler(async (req, res) => {
  return ApiResponse.success(res, 'User profile retrieved', { user: req.user }, 200);
});

export default {
  register,
  login,
  refreshToken,
  getMe,
};
