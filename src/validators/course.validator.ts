import { z } from 'zod';

export const resourceInputSchema = z.object({
  title: z.string().min(1, 'Resource title is required'),
  url: z.string().url('Invalid resource URL'),
});

export const lessonInputSchema = z.object({
  lessonId: z.string().optional(),
  title: z.string().min(1, 'Lesson title is required'),
  description: z.string().optional(),
  videoUrl: z.string().min(1, 'Video URL is required'),
  duration: z.coerce.number().min(0, 'Duration must be non-negative'),
  resources: z.array(resourceInputSchema).optional().default([]),
  order: z.coerce.number().min(0).optional().default(0),
  isPreview: z.boolean().optional().default(false),
});

export const moduleInputSchema = z.object({
  moduleId: z.string().optional(),
  moduleTitle: z.string().min(1, 'Module title is required'),
  moduleOrder: z.coerce.number().min(0).optional().default(0),
  description: z.string().optional(),
  lessons: z.array(lessonInputSchema).optional().default([]),
});

export const roadmapItemInputSchema = z.object({
  title: z.string().min(1, 'Roadmap step title is required'),
  description: z.string().optional(),
  order: z.coerce.number().min(0),
});

export const createCourseSchema = z.object({
  title: z.string().min(3, 'Course title must be at least 3 characters'),
  description: z.string().min(10, 'Course description must be at least 10 characters'),
  thumbnail: z.string().optional(),
  category: z.string().optional().default('Web Development'),
  level: z.enum(['Beginner', 'Intermediate', 'Advanced', 'All Levels']).optional().default('Beginner'),
  language: z.string().optional().default('English'),
  price: z.coerce.number().min(0, 'Price must be non-negative'),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  duration: z.string().optional().default('0 hours'),
  learningObjectives: z.array(z.string()).optional().default([]),
  prerequisites: z.array(z.string()).optional().default([]),
  skills: z.array(z.string()).optional().default([]),
  roadmap: z.array(roadmapItemInputSchema).optional().default([]),
  modules: z.array(moduleInputSchema).optional().default([]),
});

export const updateCourseSchema = createCourseSchema.partial().extend({
  status: z.enum(['draft', 'published', 'archived']).optional(),
  isPublished: z.boolean().optional(),
});

export const createModuleSchema = z.object({
  moduleTitle: z.string().min(1, 'Module title is required'),
  description: z.string().optional().default(''),
  moduleOrder: z.coerce.number().min(0).optional(),
});

export const updateModuleSchema = createModuleSchema.partial();

export const reorderModulesSchema = z.object({
  modules: z.array(
    z.object({
      moduleId: z.string().min(1),
      moduleOrder: z.coerce.number().min(0),
    })
  ),
});

export const createLessonSchema = z.object({
  title: z.string().min(1, 'Lesson title is required'),
  description: z.string().optional().default(''),
  videoUrl: z.string().min(1, 'Video URL is required'),
  duration: z.coerce.number().min(0).optional().default(0),
  resources: z.array(resourceInputSchema).optional().default([]),
  order: z.coerce.number().min(0).optional(),
  isPreview: z.boolean().optional().default(false),
});

export const updateLessonSchema = createLessonSchema.partial();

export const reorderLessonsSchema = z.object({
  lessons: z.array(
    z.object({
      lessonId: z.string().min(1),
      order: z.coerce.number().min(0),
    })
  ),
});

export const updateRoadmapSchema = z.object({
  roadmap: z.array(roadmapItemInputSchema),
});

// Legacy backward-compatible schemas
export const addChapterSchema = z.object({
  courseId: z.string().min(1),
  chapter: z.object({
    chapterId: z.string().min(1),
    chapterTitle: z.string().min(1),
    chapterOrder: z.coerce.number().min(0),
  }),
});

export const addLectureSchema = z.object({
  courseId: z.string().min(1),
  chapterId: z.string().min(1),
  lecture: z.object({
    lectureId: z.string().min(1),
    lectureTitle: z.string().min(1),
    lectureDuration: z.coerce.number().min(0),
    lectureUrl: z.string().min(1),
    lectureOrder: z.coerce.number().min(0),
    isPreviewFree: z.boolean().optional().default(false),
  }),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
