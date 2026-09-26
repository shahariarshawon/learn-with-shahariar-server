import { Response } from 'express';
import StudentService from '../services/student.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../types/express.types.js';

export const getStudentDashboard = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = (req.auth?.userId || req.user?._id) as string;
  const dashboard = await StudentService.getDashboard(studentId);

  return ApiResponse.success(res, 'Student dashboard retrieved successfully', { dashboard });
});

export const studentController = {
  getStudentDashboard,
};

export default studentController;
