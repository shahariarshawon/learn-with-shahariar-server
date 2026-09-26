import { z } from 'zod';

export const watchProgressSchema = z.object({
  lessonId: z.string().min(1, 'Lesson ID is required'),
  watchTime: z.number().min(0, 'Watch time must be >= 0'),
  lastPosition: z.number().min(0, 'Last position must be >= 0'),
  completed: z.boolean().optional(),
});

export type WatchProgressInput = z.infer<typeof watchProgressSchema>;
