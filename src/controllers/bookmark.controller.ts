import { Response } from 'express';
import BookmarkService from '../services/bookmark.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../types/express.types.js';

export const addBookmark = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = (req.auth?.userId || req.user?._id) as string;
  const { courseId, lessonId } = req.body;

  const bookmark = await BookmarkService.addBookmark({ studentId, courseId, lessonId });
  return ApiResponse.success(res, 'Lesson bookmarked successfully', { bookmark }, 201);
});

export const removeBookmark = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = (req.auth?.userId || req.user?._id) as string;
  const lessonId = req.params.lessonId as string;

  const result = await BookmarkService.removeBookmark({ studentId, lessonId });
  return ApiResponse.success(res, result.message);
});

export const getStudentBookmarks = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = (req.auth?.userId || req.user?._id) as string;

  const bookmarks = await BookmarkService.getStudentBookmarks(studentId);
  return ApiResponse.success(res, 'Bookmarks retrieved successfully', { bookmarks });
});

export const bookmarkController = {
  addBookmark,
  removeBookmark,
  getStudentBookmarks,
};

export default bookmarkController;
