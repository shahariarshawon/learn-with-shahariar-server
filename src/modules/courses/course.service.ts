import { v2 as cloudinary } from 'cloudinary';
import Course from './course.model.js';
import User from '../users/user.model.js';
import { ApiError } from '../../utils/apiError.js';
import { slugify } from '../../utils/slugify.js';
import { ICourse, CourseStatus } from './course.types.js';

export class CourseService {
  static async createCourse({
    instructorId,
    courseDataRaw,
    imageFile,
  }: {
    instructorId: string;
    courseDataRaw: any;
    imageFile?: Express.Multer.File;
  }) {
    let courseData: Partial<ICourse> = {};
    if (typeof courseDataRaw === 'string') {
      try {
        courseData = JSON.parse(courseDataRaw);
      } catch (err) {
        throw new ApiError(400, 'Invalid JSON payload for courseData');
      }
    } else {
      courseData = { ...courseDataRaw };
    }

    const title = courseData.courseTitle || courseData.title;
    const description = courseData.courseDescription || courseData.description;
    const price = courseData.coursePrice ?? courseData.price ?? 0;

    if (!title || !description) {
      throw new ApiError(400, 'Title and description are required fields');
    }

    let thumbnailUrl = courseData.courseThumbnail || courseData.thumbnail || '';
    if (imageFile) {
      const uploadRes = await cloudinary.uploader.upload(imageFile.path, {
        folder: 'lws/courses',
      });
      thumbnailUrl = uploadRes.secure_url;
    }

    const slug = slugify(title);

    const newCourse = await Course.create({
      ...courseData,
      courseTitle: title,
      courseDescription: description,
      coursePrice: price,
      courseThumbnail: thumbnailUrl,
      slug,
      educator: instructorId,
      status: 'published',
      approvalStatus: 'approved',
      isPublished: true,
      modules: courseData.modules || [],
    });

    await User.findByIdAndUpdate(instructorId, {
      $addToSet: { enrolledCourses: newCourse._id },
    });

    return newCourse;
  }

  static async getPublicCourses(query: {
    search?: string;
    category?: string;
    level?: string;
    page?: string;
    limit?: string;
  }) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(query.limit || '12', 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {
      isPublished: true,
      status: 'published',
    };

    if (query.category) {
      filter.category = query.category;
    }

    if (query.level) {
      filter.level = query.level;
    }

    if (query.search) {
      const searchRegex = new RegExp(query.search, 'i');
      filter.$or = [
        { courseTitle: searchRegex },
        { courseDescription: searchRegex },
        { category: searchRegex },
        { skills: searchRegex },
      ];
    }

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .select('-modules.lessons.videoUrl')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(filter),
    ]);

    return {
      courses,
      allCourses: courses,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  static async getInstructorCourses(instructorId: string, isAdmin: boolean = false) {
    const ownCourses = await Course.find({ educator: instructorId }).sort({ createdAt: -1 });
    if (isAdmin && ownCourses.length === 0) {
      return await Course.find().sort({ createdAt: -1 });
    }
    return ownCourses;
  }

  static async getCourseByIdOrSlug(idOrSlug: string, isInstructorOrAdmin: boolean = false) {
    let course: any = null;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      course = await Course.findById(idOrSlug);
    }

    if (!course) {
      course = await Course.findOne({ slug: idOrSlug.toLowerCase() });
    }

    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    if (!isInstructorOrAdmin) {
      const courseObj = course.toObject();
      if (courseObj.modules) {
        courseObj.modules = courseObj.modules.map((mod: any) => ({
          ...mod,
          lessons: (mod.lessons || []).map((les: any) => ({
            ...les,
            videoUrl: les.isPreview ? les.videoUrl : undefined,
          })),
        }));
      }
      return courseObj;
    }

    return course;
  }

  static async updateCourse(courseId: string, updateData: Partial<ICourse>) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    if (updateData.courseTitle && updateData.courseTitle !== course.courseTitle) {
      updateData.slug = slugify(updateData.courseTitle);
    }

    Object.assign(course, updateData);
    await course.save();
    return course;
  }

  static async deleteCourse(courseId: string) {
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }
    return { message: 'Course deleted successfully' };
  }

  static async setCourseStatus(courseId: string, status: CourseStatus) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    course.status = status;
    course.isPublished = status === 'published';
    await course.save();
    return course;
  }

  static async addModule(courseId: string, moduleData: { moduleTitle: string; description?: string }) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const moduleOrder = course.modules ? course.modules.length + 1 : 1;
    const newModule = {
      moduleId: new Date().getTime().toString(),
      moduleTitle: moduleData.moduleTitle,
      moduleOrder,
      description: moduleData.description || '',
      lessons: [],
    };

    course.modules.push(newModule as any);
    await course.save();
    return course;
  }

  static async updateModule(
    courseId: string,
    moduleId: string,
    updateData: { moduleTitle?: string; description?: string }
  ) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const moduleIndex = course.modules.findIndex((m: any) => m.moduleId === moduleId);
    if (moduleIndex === -1) {
      throw new ApiError(404, 'Module not found');
    }

    if (updateData.moduleTitle) course.modules[moduleIndex].moduleTitle = updateData.moduleTitle;
    if (updateData.description !== undefined) course.modules[moduleIndex].description = updateData.description;

    await course.save();
    return course;
  }

  static async deleteModule(courseId: string, moduleId: string) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    course.modules = course.modules.filter((m: any) => m.moduleId !== moduleId);
    await course.save();
    return course;
  }

  static async reorderModules(courseId: string, orderedModuleIds: string[]) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const moduleMap = new Map(course.modules.map((m: any) => [m.moduleId, m]));
    const reordered: any[] = [];

    orderedModuleIds.forEach((id, index) => {
      const mod = moduleMap.get(id);
      if (mod) {
        mod.moduleOrder = index + 1;
        reordered.push(mod);
      }
    });

    course.modules = reordered as any;
    await course.save();
    return course;
  }

  static async addLesson(courseId: string, moduleId: string, lessonData: any) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const mod = course.modules.find((m: any) => m.moduleId === moduleId);
    if (!mod) {
      throw new ApiError(404, 'Module not found');
    }

    const order = mod.lessons ? mod.lessons.length + 1 : 1;
    const newLesson = {
      lessonId: new Date().getTime().toString(),
      title: lessonData.title || lessonData.lectureTitle,
      description: lessonData.description || '',
      videoUrl: lessonData.videoUrl || lessonData.lectureUrl || '',
      duration: lessonData.duration || lessonData.lectureDuration || 0,
      order,
      isPreview: lessonData.isPreview ?? lessonData.isPreviewFree ?? false,
      resources: lessonData.resources || [],
    };

    mod.lessons.push(newLesson as any);
    await course.save();
    return course;
  }

  static async updateLesson(courseId: string, lessonId: string, lessonData: any) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    let foundLesson = false;
    for (const mod of course.modules) {
      const les = (mod.lessons as any[]).find((l: any) => l.lessonId === lessonId || l._id?.toString() === lessonId);
      if (les) {
        Object.assign(les, lessonData);
        foundLesson = true;
        break;
      }
    }

    if (!foundLesson) {
      throw new ApiError(404, 'Lesson not found');
    }

    await course.save();
    return course;
  }

  static async deleteLesson(courseId: string, lessonId: string) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    course.modules.forEach((mod: any) => {
      mod.lessons = mod.lessons.filter((l: any) => l.lessonId !== lessonId && l._id?.toString() !== lessonId);
    });

    await course.save();
    return course;
  }

  static async reorderLessons(courseId: string, moduleId: string, orderedLessonIds: string[]) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const mod = course.modules.find((m: any) => m.moduleId === moduleId);
    if (!mod) {
      throw new ApiError(404, 'Module not found');
    }

    const lessonMap = new Map((mod.lessons as any[]).map((l: any) => [l.lessonId || l._id?.toString(), l]));
    const reordered: any[] = [];

    orderedLessonIds.forEach((id, index) => {
      const les = lessonMap.get(id);
      if (les) {
        les.order = index + 1;
        reordered.push(les);
      }
    });

    mod.lessons = reordered as any;
    await course.save();
    return course;
  }

  static async updateRoadmap(courseId: string, roadmap: any[]) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    course.roadmap = roadmap;
    await course.save();
    return course;
  }

  static async addChapter(courseId: string, chapter: any) {
    return this.addModule(courseId, {
      moduleTitle: chapter.chapterTitle || 'Chapter',
    });
  }

  static async addLecture(courseId: string, chapterId: string, lecture: any) {
    return this.addLesson(courseId, chapterId, lecture);
  }
}

export default CourseService;
