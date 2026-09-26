import mongoose from 'mongoose';
import Course from '../models/Course.js';
import Lesson from '../models/Lesson.js';
import { ApiError } from '../utils/apiError.js';
import { slugify, generateUniqueSlug } from '../utils/slugify.js';
import { IModule, IRoadmapItem, CourseStatus } from '../types/course.types.js';
import { ILesson } from '../types/lesson.types.js';
import { v2 as cloudinary } from 'cloudinary';

export class CourseService {
  /**
   * Create a new course
   */
  static async createCourse({
    instructorId,
    courseDataRaw,
    imageFile,
  }: {
    instructorId: string;
    courseDataRaw: any;
    imageFile?: Express.Multer.File;
  }) {
    let parsedData: any;
    if (typeof courseDataRaw === 'string') {
      try {
        parsedData = JSON.parse(courseDataRaw);
      } catch (err) {
        throw new ApiError(400, 'Invalid JSON format in courseData');
      }
    } else {
      parsedData = courseDataRaw || {};
    }

    const title = parsedData.title || parsedData.courseTitle;
    if (!title) {
      throw new ApiError(400, 'Course title is required');
    }

    const description = parsedData.description || parsedData.courseDescription;
    if (!description) {
      throw new ApiError(400, 'Course description is required');
    }

    // Auto-generate unique slug
    let baseSlug = slugify(title);
    let slug = baseSlug;
    let count = 1;
    while (await Course.findOne({ slug })) {
      slug = generateUniqueSlug(title, `${count++}`);
    }

    // Handle thumbnail upload if provided
    let thumbnail = parsedData.thumbnail || parsedData.courseThumbnail || '';
    if (imageFile) {
      const uploadResult = await cloudinary.uploader.upload(imageFile.path, {
        folder: 'lws_courses',
      });
      thumbnail = uploadResult.secure_url;
    }

    const price = Number(parsedData.price ?? parsedData.coursePrice ?? 0);
    const discount = Number(parsedData.discount ?? parsedData.discountPrice ?? 0);

    const newCourse = await Course.create({
      courseTitle: title,
      slug,
      courseDescription: description,
      courseThumbnail: thumbnail,
      category: parsedData.category || 'Web Development',
      level: parsedData.level || 'Beginner',
      language: parsedData.language || 'English',
      coursePrice: price,
      discount,
      duration: parsedData.duration || '0 hours',
      status: parsedData.status || (parsedData.isPublished === false ? 'draft' : 'published'),
      educator: instructorId,
      learningObjectives: parsedData.learningObjectives || [],
      prerequisites: parsedData.prerequisites || [],
      skills: parsedData.skills || [],
      roadmap: parsedData.roadmap || [],
      modules: parsedData.modules || [],
    });

    return newCourse;
  }

  /**
   * Get public published courses with catalogue filtering & pagination
   */
  static async getPublicCourses(query: {
    search?: string;
    category?: string;
    level?: string;
    page?: number;
    limit?: number;
  }) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {
      status: 'published',
      isPublished: true,
    };

    if (query.category) {
      filter.category = query.category;
    }

    if (query.level) {
      filter.level = query.level;
    }

    if (query.search) {
      filter.$or = [
        { courseTitle: { $regex: query.search, $options: 'i' } },
        { courseDescription: { $regex: query.search, $options: 'i' } },
        { skills: { $in: [new RegExp(query.search, 'i')] } },
      ];
    }

    const totalCourses = await Course.countDocuments(filter);
    const publishedCourses = await Course.countDocuments({ status: 'published' });

    const courses = await Course.find(filter)
      .select(['-enrolledStudents'])
      .populate('educator', 'name imageUrl profileImage bio skills')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return {
      totalCourses,
      publishedCourses,
      page,
      totalPages: Math.ceil(totalCourses / limit),
      courses,
    };
  }

  /**
   * Get course by Mongo ID or Slug
   */
  static async getCourseByIdOrSlug(idOrSlug: string, isInstructorOrAdmin: boolean = false) {
    let query: Record<string, any> = {};

    if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
      query._id = idOrSlug;
    } else {
      query.slug = idOrSlug.toLowerCase();
    }

    const courseData = await Course.findOne(query).populate(
      'educator',
      'name imageUrl profileImage bio skills'
    );

    if (!courseData) {
      throw new ApiError(404, 'Course not found');
    }

    // Mask non-free preview video URLs for unauthenticated/un-enrolled visitors
    if (!isInstructorOrAdmin && courseData.modules && Array.isArray(courseData.modules)) {
      courseData.modules.forEach((mod: IModule) => {
        if (mod.lessons && Array.isArray(mod.lessons)) {
          mod.lessons.forEach((les: ILesson) => {
            if (!les.isPreview) {
              les.videoUrl = '';
            }
          });
        }
      });
    }

    return courseData;
  }

  /**
   * Get instructor's own courses
   */
  static async getInstructorCourses(instructorId: string) {
    const courses = await Course.find({ educator: instructorId }).sort({ createdAt: -1 });
    return courses;
  }

  /**
   * Update course details
   */
  static async updateCourse(courseId: string, updateData: Record<string, any>) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    // Map aliases
    if (updateData.title && !updateData.courseTitle) updateData.courseTitle = updateData.title;
    if (updateData.description && !updateData.courseDescription) updateData.courseDescription = updateData.description;
    if (updateData.thumbnail && !updateData.courseThumbnail) updateData.courseThumbnail = updateData.thumbnail;
    if (updateData.price !== undefined && !updateData.coursePrice) updateData.coursePrice = updateData.price;

    // Update slug if title changes
    if (updateData.courseTitle && updateData.courseTitle !== course.courseTitle) {
      let baseSlug = slugify(updateData.courseTitle);
      let newSlug = baseSlug;
      let count = 1;
      while (await Course.findOne({ slug: newSlug, _id: { $ne: courseId } })) {
        newSlug = generateUniqueSlug(updateData.courseTitle, `${count++}`);
      }
      course.slug = newSlug;
    }

    Object.keys(updateData).forEach((key) => {
      (course as any)[key] = updateData[key];
    });

    await course.save();
    return course;
  }

  /**
   * Delete course
   */
  static async deleteCourse(courseId: string) {
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }
    // Delete associated standalone lessons
    await Lesson.deleteMany({ courseId });
    return { message: 'Course deleted successfully' };
  }

  /**
   * Publish / Unpublish / Set Status
   */
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

  // ==================== SYLLABUS: MODULE OPERATIONS ====================

  static async addModule(courseId: string, moduleData: { moduleTitle: string; description?: string; moduleOrder?: number }) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const nextOrder = moduleData.moduleOrder ?? course.modules.length;
    const newModule: IModule = {
      moduleId: new mongoose.Types.ObjectId().toString(),
      moduleTitle: moduleData.moduleTitle,
      moduleOrder: nextOrder,
      description: moduleData.description || '',
      lessons: [],
    };

    course.modules.push(newModule);
    await course.save();
    return course;
  }

  static async updateModule(
    courseId: string,
    moduleId: string,
    updateData: { moduleTitle?: string; description?: string; moduleOrder?: number }
  ) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const module = course.modules.find((m) => m.moduleId === moduleId);
    if (!module) {
      throw new ApiError(404, 'Module not found');
    }

    if (updateData.moduleTitle !== undefined) module.moduleTitle = updateData.moduleTitle;
    if (updateData.description !== undefined) module.description = updateData.description;
    if (updateData.moduleOrder !== undefined) module.moduleOrder = updateData.moduleOrder;

    await course.save();
    return course;
  }

  static async deleteModule(courseId: string, moduleId: string) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const initialLength = course.modules.length;
    course.modules = course.modules.filter((m) => m.moduleId !== moduleId);

    if (course.modules.length === initialLength) {
      throw new ApiError(404, 'Module not found');
    }

    await course.save();
    await Lesson.deleteMany({ courseId, moduleId });

    return course;
  }

  static async reorderModules(courseId: string, modulesOrder: Array<{ moduleId: string; moduleOrder: number }>) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const orderMap = new Map(modulesOrder.map((m) => [m.moduleId, m.moduleOrder]));
    course.modules.forEach((mod) => {
      if (orderMap.has(mod.moduleId)) {
        mod.moduleOrder = orderMap.get(mod.moduleId)!;
      }
    });

    course.modules.sort((a, b) => a.moduleOrder - b.moduleOrder);
    await course.save();
    return course;
  }

  // ==================== SYLLABUS: LESSON OPERATIONS ====================

  static async addLesson(
    courseId: string,
    moduleId: string,
    lessonData: {
      title: string;
      description?: string;
      videoUrl: string;
      duration?: number;
      resources?: Array<{ title: string; url: string }>;
      order?: number;
      isPreview?: boolean;
    }
  ) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const module = course.modules.find((m) => m.moduleId === moduleId);
    if (!module) {
      throw new ApiError(404, 'Module not found in course');
    }

    const lessonId = new mongoose.Types.ObjectId().toString();
    const order = lessonData.order ?? module.lessons.length;

    const newLesson: ILesson = {
      _id: lessonId,
      title: lessonData.title,
      description: lessonData.description || '',
      videoUrl: lessonData.videoUrl,
      duration: lessonData.duration || 0,
      resources: lessonData.resources || [],
      moduleId,
      courseId,
      order,
      isPreview: lessonData.isPreview ?? false,
    };

    module.lessons.push(newLesson as any);
    await course.save();

    // Create standalone Lesson record
    await Lesson.create({
      _id: lessonId,
      title: lessonData.title,
      description: lessonData.description || '',
      videoUrl: lessonData.videoUrl,
      duration: lessonData.duration || 0,
      resources: lessonData.resources || [],
      moduleId,
      courseId,
      order,
      isPreview: lessonData.isPreview ?? false,
    });

    return course;
  }

  static async updateLesson(
    courseId: string,
    lessonId: string,
    updateData: Partial<ILesson>
  ) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    let targetLesson: any = null;
    for (const mod of course.modules) {
      const les = mod.lessons.find(
        (l: any) => l.lessonId === lessonId || l._id?.toString() === lessonId
      );
      if (les) {
        targetLesson = les;
        break;
      }
    }

    if (!targetLesson) {
      throw new ApiError(404, 'Lesson not found in course');
    }

    Object.assign(targetLesson, updateData);
    await course.save();

    // Sync standalone Lesson model
    await Lesson.findByIdAndUpdate(lessonId, updateData);

    return course;
  }

  static async deleteLesson(courseId: string, lessonId: string) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    let deleted = false;
    course.modules.forEach((mod) => {
      const initialCount = mod.lessons.length;
      mod.lessons = mod.lessons.filter(
        (l: any) => l.lessonId !== lessonId && l._id?.toString() !== lessonId
      );
      if (mod.lessons.length < initialCount) {
        deleted = true;
      }
    });

    if (!deleted) {
      throw new ApiError(404, 'Lesson not found in course');
    }

    await course.save();
    await Lesson.findByIdAndDelete(lessonId);

    return course;
  }

  static async reorderLessons(
    courseId: string,
    moduleId: string,
    lessonsOrder: Array<{ lessonId: string; order: number }>
  ) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const module = course.modules.find((m) => m.moduleId === moduleId);
    if (!module) {
      throw new ApiError(404, 'Module not found');
    }

    const orderMap = new Map(lessonsOrder.map((l) => [l.lessonId, l.order]));
    module.lessons.forEach((les: any) => {
      const id = les.lessonId || les._id?.toString();
      if (orderMap.has(id)) {
        les.order = orderMap.get(id)!;
      }
    });

    module.lessons.sort((a: any, b: any) => a.order - b.order);
    await course.save();

    return course;
  }

  // ==================== ROADMAP OPERATIONS ====================

  static async updateRoadmap(courseId: string, roadmap: IRoadmapItem[]) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    course.roadmap = roadmap.sort((a, b) => a.order - b.order);
    await course.save();

    return course;
  }

  // Legacy method preservation
  static async getAllCourses() {
    return this.getPublicCourses({});
  }

  static async getCourseById(id: string) {
    return this.getCourseByIdOrSlug(id);
  }

  static async getEducatorCourses(educatorId: string) {
    return this.getInstructorCourses(educatorId);
  }

  static async addChapter(courseId: string, chapter: any) {
    return this.addModule(courseId, {
      moduleTitle: chapter.chapterTitle,
      moduleOrder: chapter.chapterOrder,
    });
  }

  static async addLecture(courseId: string, chapterId: string, lecture: any) {
    return this.addLesson(courseId, chapterId, {
      title: lecture.lectureTitle,
      videoUrl: lecture.lectureUrl,
      duration: lecture.lectureDuration,
      order: lecture.lectureOrder,
      isPreview: lecture.isPreviewFree,
    });
  }
}

export default CourseService;
