import { z } from 'zod';

export const completeLessonSchema = z.object({
  courseId: z.string().min(1, 'courseId is required'),
  lessonId: z.string().min(1, 'lessonId is required'),
  watchTime: z.coerce.number().min(0).optional(),
});

export const watchPositionSchema = z.object({
  courseId: z.string().min(1, 'courseId is required'),
  lessonId: z.string().min(1, 'lessonId is required'),
  watchTime: z.coerce.number().min(0).optional().default(0),
  lastPosition: z.coerce.number().min(0, 'lastPosition must be non-negative'),
});

export const createBookmarkSchema = z.object({
  courseId: z.string().min(1, 'courseId is required'),
  lessonId: z.string().min(1, 'lessonId is required'),
});

export const createNoteSchema = z.object({
  courseId: z.string().min(1, 'courseId is required'),
  lessonId: z.string().min(1, 'lessonId is required'),
  content: z.string().min(1, 'Note content cannot be empty'),
  videoTimestamp: z.coerce.number().min(0).optional().default(0),
});

export const updateNoteSchema = z.object({
  content: z.string().min(1, 'Note content cannot be empty').optional(),
  videoTimestamp: z.coerce.number().min(0).optional(),
});

export type CompleteLessonInput = z.infer<typeof completeLessonSchema>;
export type WatchPositionInput = z.infer<typeof watchPositionSchema>;
export type CreateBookmarkInput = z.infer<typeof createBookmarkSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
