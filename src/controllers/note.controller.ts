import { Response } from 'express';
import NoteService from '../services/note.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../types/express.types.js';

export const createNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = (req.auth?.userId || req.user?._id) as string;
  const { courseId, lessonId, content, videoTimestamp } = req.body;

  const note = await NoteService.createNote({
    studentId,
    courseId,
    lessonId,
    content,
    videoTimestamp,
  });

  return ApiResponse.success(res, 'Study note created', { note }, 201);
});

export const updateNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = (req.auth?.userId || req.user?._id) as string;
  const noteId = req.params.id as string;
  const { content, videoTimestamp } = req.body;

  const note = await NoteService.updateNote({
    noteId,
    studentId,
    content,
    videoTimestamp,
  });

  return ApiResponse.success(res, 'Study note updated', { note });
});

export const deleteNote = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = (req.auth?.userId || req.user?._id) as string;
  const noteId = req.params.id as string;

  const result = await NoteService.deleteNote({ noteId, studentId });
  return ApiResponse.success(res, result.message);
});

export const getLessonNotes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = (req.auth?.userId || req.user?._id) as string;
  const lessonId = req.params.lessonId as string;

  const notes = await NoteService.getLessonNotes({ studentId, lessonId });
  return ApiResponse.success(res, 'Lesson notes retrieved', { notes });
});

export const getCourseNotes = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const studentId = (req.auth?.userId || req.user?._id) as string;
  const courseId = req.params.courseId as string;

  const notes = await NoteService.getCourseNotes({ studentId, courseId });
  return ApiResponse.success(res, 'Course notes retrieved', { notes });
});

export const noteController = {
  createNote,
  updateNote,
  deleteNote,
  getLessonNotes,
  getCourseNotes,
};

export default noteController;
