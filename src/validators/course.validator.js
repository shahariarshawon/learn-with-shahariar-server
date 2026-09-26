import { z } from 'zod';

export const lectureSchema = z.object({
  lectureId: z.string().min(1, 'lectureId is required'),
  lectureTitle: z.string().min(1, 'lectureTitle is required'),
  lectureDuration: z.coerce.number().min(0, 'lectureDuration must be positive'),
  lectureUrl: z.string().min(1, 'lectureUrl is required'),
  isPreviewFree: z.boolean().optional().default(true),
  lectureOrder: z.coerce.number().min(0, 'lectureOrder must be non-negative'),
});

export const chapterSchema = z.object({
  chapterId: z.string().min(1, 'chapterId is required'),
  chapterOrder: z.coerce.number().min(0, 'chapterOrder must be non-negative'),
  chapterTitle: z.string().min(1, 'chapterTitle is required'),
  chapterContent: z.array(lectureSchema).optional().default([]),
});

export const addChapterSchema = z.object({
  courseId: z.string().min(1, 'courseId is required'),
  chapter: z.object({
    chapterId: z.string().min(1, 'chapterId is required'),
    chapterTitle: z.string().min(1, 'chapterTitle is required'),
    chapterOrder: z.coerce.number().min(0),
  }),
});

export const addLectureSchema = z.object({
  courseId: z.string().min(1, 'courseId is required'),
  chapterId: z.string().min(1, 'chapterId is required'),
  lecture: z.object({
    lectureId: z.string().min(1, 'lectureId is required'),
    lectureTitle: z.string().min(1, 'lectureTitle is required'),
    lectureDuration: z.coerce.number().min(0),
    lectureUrl: z.string().min(1, 'lectureUrl is required'),
    lectureOrder: z.coerce.number().min(0),
    isPreviewFree: z.boolean().optional().default(false),
  }),
});
