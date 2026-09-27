import { v2 as cloudinary } from 'cloudinary';
import Course from './course.model.js';
import User from '../users/user.model.js';
import { ApiError } from '../../utils/apiError.js';
import { slugify } from '../../utils/slugify.js';
import { ICourse, CourseStatus } from './course.types.js';

export function serializeCourse(courseDoc: any) {
  if (!courseDoc) return null;
  const raw = typeof courseDoc.toObject === 'function' ? courseDoc.toObject({ virtuals: true }) : { ...courseDoc };

  const id = raw._id?.toString() || raw.id;
  const title = raw.courseTitle || raw.title || 'Untitled Course';
  const description = raw.courseDescription || raw.description || '';
  const thumbnail = raw.courseThumbnail || raw.thumbnail || '';
  const price = raw.coursePrice ?? raw.price ?? 0;
  const discount = raw.discount ?? 0;
  const discountPrice = Number((price - (discount * price) / 100).toFixed(2));
  const ratings = raw.courseRatings || [];
  const avgRating = ratings.length > 0
    ? Number((ratings.reduce((acc: number, curr: any) => acc + (curr.rating || 5), 0) / ratings.length).toFixed(1))
    : 4.8;
  const studentCount = Array.isArray(raw.enrolledStudents) ? raw.enrolledStudents.length : 0;

  // Build modules
  let modules = raw.modules || [];
  if ((!modules || modules.length === 0) && Array.isArray(raw.courseContent) && raw.courseContent.length > 0) {
    modules = raw.courseContent.map((ch: any, idx: number) => ({
      moduleId: ch.chapterId || String(idx + 1),
      moduleTitle: ch.chapterTitle || ch.title || `Module ${idx + 1}`,
      title: ch.chapterTitle || ch.title || `Module ${idx + 1}`,
      moduleOrder: ch.chapterOrder || idx + 1,
      order: ch.chapterOrder || idx + 1,
      description: ch.description || '',
      lessons: (ch.chapterContent || []).map((lec: any, lIdx: number) => ({
        lessonId: lec.lectureId || lec.lessonId || String(lIdx + 1),
        title: lec.lectureTitle || lec.title || `Lesson ${lIdx + 1}`,
        description: lec.description || '',
        videoUrl: lec.lectureUrl || lec.videoUrl || '',
        duration: Number(lec.lectureDuration || lec.duration || 0),
        order: lec.lectureOrder || lec.order || lIdx + 1,
        isPreview: Boolean(lec.isPreviewFree ?? lec.isPreview ?? false),
        resources: lec.resources || [],
      })),
    }));
  }

  // Build courseContent
  const courseContent = modules.map((mod: any, mIdx: number) => ({
    chapterId: mod.moduleId || String(mIdx + 1),
    chapterOrder: mod.moduleOrder || mod.order || mIdx + 1,
    chapterTitle: mod.moduleTitle || mod.title || `Module ${mIdx + 1}`,
    chapterContent: (mod.lessons || []).map((les: any, lIdx: number) => ({
      lectureId: les.lessonId || les.lectureId || les._id?.toString() || String(lIdx + 1),
      lectureTitle: les.title || les.lectureTitle || `Lesson ${lIdx + 1}`,
      lectureDuration: les.duration || les.lectureDuration || 0,
      lectureUrl: les.videoUrl || les.lectureUrl || '',
      isPreviewFree: les.isPreview ?? les.isPreviewFree ?? true,
      lectureOrder: les.order || les.lectureOrder || lIdx + 1,
      description: les.description || '',
      resources: les.resources || [],
    })),
  }));

  const requirements = raw.prerequisites || raw.requirements || [];
  const learningObjectives = raw.learningObjectives || raw.learningOutcomes || [];

  return {
    ...raw,
    _id: id,
    id,
    courseTitle: title,
    title,
    courseDescription: description,
    description,
    courseThumbnail: thumbnail,
    thumbnail,
    coursePrice: price,
    price,
    discount,
    discountPrice,
    rating: avgRating,
    students: studentCount,
    duration: raw.duration || '24 hours',
    learningObjectives,
    learningOutcomes: learningObjectives,
    prerequisites: requirements,
    requirements,
    modules,
    courseContent,
    status: raw.status || 'published',
    approvalStatus: raw.approvalStatus || 'approved',
    isPublished: raw.isPublished !== false,
  };
}

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
    let courseData: any = {};
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

    // Convert courseContent to modules if provided
    let modules = courseData.modules || [];
    if ((!modules || modules.length === 0) && Array.isArray(courseData.courseContent)) {
      modules = courseData.courseContent.map((ch: any, idx: number) => ({
        moduleId: ch.chapterId || String(idx + 1),
        moduleTitle: ch.chapterTitle || ch.title || `Module ${idx + 1}`,
        title: ch.chapterTitle || ch.title || `Module ${idx + 1}`,
        moduleOrder: ch.chapterOrder || idx + 1,
        order: ch.chapterOrder || idx + 1,
        description: ch.description || '',
        lessons: (ch.chapterContent || []).map((lec: any, lIdx: number) => ({
          lessonId: lec.lectureId || lec.lessonId || String(lIdx + 1),
          title: lec.lectureTitle || lec.title || `Lesson ${lIdx + 1}`,
          description: lec.description || '',
          videoUrl: lec.lectureUrl || lec.videoUrl || '',
          duration: Number(lec.lectureDuration || lec.duration || 0),
          order: lec.lectureOrder || lec.order || lIdx + 1,
          isPreview: Boolean(lec.isPreviewFree ?? lec.isPreview ?? false),
          resources: lec.resources || [],
        })),
      }));
    }

    const newCourse = await Course.create({
      ...courseData,
      courseTitle: title,
      title,
      courseDescription: description,
      description,
      coursePrice: price,
      price,
      courseThumbnail: thumbnailUrl,
      thumbnail: thumbnailUrl,
      slug,
      educator: instructorId,
      status: courseData.status || 'published',
      approvalStatus: courseData.approvalStatus || 'approved',
      isPublished: courseData.status ? courseData.status === 'published' : true,
      modules,
    });

    await User.findByIdAndUpdate(instructorId, {
      $addToSet: { enrolledCourses: newCourse._id },
    });

    return serializeCourse(newCourse);
  }

  static async getPublicCourses(query: {
    search?: string;
    category?: string;
    level?: string;
    price?: string;
    sortBy?: string;
    sort?: string;
    page?: string;
    limit?: string;
  }) {
    const page = Math.max(1, parseInt(query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(query.limit || '24', 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {
      isPublished: true,
      status: 'published',
    };

    // Category filter
    if (query.category && query.category !== 'All' && query.category !== 'All Categories') {
      filter.category = new RegExp(`^${query.category.trim()}$`, 'i');
    }

    // Level filter
    if (query.level && query.level !== 'All') {
      filter.level = new RegExp(`^${query.level.trim()}$`, 'i');
    }

    // Price range filter
    if (query.price && query.price !== 'All') {
      if (query.price === 'under-75') {
        filter.coursePrice = { $lt: 75 };
      } else if (query.price === '75-90') {
        filter.coursePrice = { $gte: 75, $lte: 90 };
      } else if (query.price === 'over-90') {
        filter.coursePrice = { $gt: 90 };
      }
    }

    // Search query: by title, category, skills, description, or instructor
    if (query.search && query.search.trim()) {
      const searchRegex = new RegExp(query.search.trim(), 'i');
      const matchingInstructors = await User.find({
        $or: [{ name: searchRegex }, { email: searchRegex }],
      }).select('_id');
      const instructorIds = matchingInstructors.map((u) => u._id.toString());

      filter.$or = [
        { courseTitle: searchRegex },
        { courseDescription: searchRegex },
        { category: searchRegex },
        { skills: searchRegex },
        { educator: { $in: instructorIds } },
      ];
    }

    // Sorting
    let sortOptions: Record<string, any> = { createdAt: -1 };
    const sortParam = query.sortBy || query.sort || 'popular';

    if (sortParam === 'newest') {
      sortOptions = { createdAt: -1 };
    } else if (sortParam === 'price-low') {
      sortOptions = { coursePrice: 1 };
    } else if (sortParam === 'price-high') {
      sortOptions = { coursePrice: -1 };
    } else if (sortParam === 'title') {
      sortOptions = { courseTitle: 1 };
    } else if (sortParam === 'highest-rated' || sortParam === 'rating') {
      sortOptions = { 'courseRatings.rating': -1, createdAt: -1 };
    }

    const [rawCourses, total] = await Promise.all([
      Course.find(filter)
        .populate('educator', 'name email profileImage')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Course.countDocuments(filter),
    ]);

    const serialized = rawCourses.map(serializeCourse);

    return {
      courses: serialized,
      allCourses: serialized,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  static async getInstructorCourses(instructorId: string, isAdmin: boolean = false) {
    const query = isAdmin ? {} : { educator: instructorId };
    const courses = await Course.find(query)
      .populate('educator', 'name email profileImage')
      .sort({ createdAt: -1 })
      .lean();

    return courses.map(serializeCourse);
  }

  static async getCourseByIdOrSlug(idOrSlug: string, isInstructorOrAdmin: boolean = false) {
    let course: any = null;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      course = await Course.findById(idOrSlug).populate('educator', 'name email profileImage');
    }

    if (!course) {
      course = await Course.findOne({ slug: idOrSlug.toLowerCase() }).populate('educator', 'name email profileImage');
    }

    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    const serialized = serializeCourse(course);

    if (!isInstructorOrAdmin && serialized?.modules) {
      serialized.modules = serialized.modules.map((mod: any) => ({
        ...mod,
        lessons: (mod.lessons || []).map((les: any) => ({
          ...les,
          videoUrl: les.isPreview ? les.videoUrl : undefined,
        })),
      }));
    }

    return serialized;
  }

  static async updateCourse(courseId: string, updateData: any) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    // Title & slug handling
    const newTitle = updateData.courseTitle || updateData.title;
    if (newTitle && newTitle !== course.courseTitle) {
      course.courseTitle = newTitle;
      course.slug = slugify(newTitle);
    }

    // Description
    if (updateData.courseDescription !== undefined || updateData.description !== undefined) {
      course.courseDescription = updateData.courseDescription ?? updateData.description;
    }

    // Thumbnail
    if (updateData.courseThumbnail !== undefined || updateData.thumbnail !== undefined) {
      course.courseThumbnail = updateData.courseThumbnail ?? updateData.thumbnail;
    }

    // Price
    if (updateData.coursePrice !== undefined || updateData.price !== undefined) {
      course.coursePrice = Number(updateData.coursePrice ?? updateData.price) || 0;
    }

    // Discount
    if (updateData.discount !== undefined) {
      course.discount = Number(updateData.discount) || 0;
    }

    // Category & Level
    if (updateData.category) course.category = updateData.category;
    if (updateData.level) course.level = updateData.level;
    if (updateData.duration) course.duration = updateData.duration;

    // Requirements / Prerequisites
    if (updateData.requirements || updateData.prerequisites) {
      course.prerequisites = updateData.prerequisites || updateData.requirements;
    }
    if (updateData.learningObjectives || updateData.learningOutcomes) {
      course.learningObjectives = updateData.learningObjectives || updateData.learningOutcomes;
    }

    // Status
    if (updateData.status) {
      course.status = updateData.status;
      course.isPublished = updateData.status === 'published';
    }
    if (updateData.approvalStatus) {
      course.approvalStatus = updateData.approvalStatus;
    }

    // Course Content / Modules
    if (Array.isArray(updateData.courseContent)) {
      course.modules = updateData.courseContent.map((ch: any, idx: number) => ({
        moduleId: ch.chapterId || String(idx + 1),
        moduleTitle: ch.chapterTitle || ch.title || `Module ${idx + 1}`,
        title: ch.chapterTitle || ch.title || `Module ${idx + 1}`,
        moduleOrder: ch.chapterOrder || idx + 1,
        order: ch.chapterOrder || idx + 1,
        description: ch.description || '',
        lessons: (ch.chapterContent || []).map((lec: any, lIdx: number) => ({
          lessonId: lec.lectureId || lec.lessonId || String(lIdx + 1),
          title: lec.lectureTitle || lec.title || `Lesson ${lIdx + 1}`,
          description: lec.description || '',
          videoUrl: lec.lectureUrl || lec.videoUrl || '',
          duration: Number(lec.lectureDuration || lec.duration || 0),
          order: lec.lectureOrder || lec.order || lIdx + 1,
          isPreview: Boolean(lec.isPreviewFree ?? lec.isPreview ?? false),
          resources: lec.resources || [],
        })),
      })) as any;
    } else if (Array.isArray(updateData.modules)) {
      course.modules = updateData.modules;
    }

    await course.save();
    return serializeCourse(course);
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
    return serializeCourse(course);
  }

  static async submitForReview(courseId: string) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    course.approvalStatus = 'pending';
    course.status = 'draft';
    course.isPublished = false;
    await course.save();
    return serializeCourse(course);
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
      title: moduleData.moduleTitle,
      moduleOrder,
      order: moduleOrder,
      description: moduleData.description || '',
      lessons: [],
    };

    course.modules.push(newModule as any);
    await course.save();
    return serializeCourse(course);
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

    if (updateData.moduleTitle) {
      course.modules[moduleIndex].moduleTitle = updateData.moduleTitle;
      (course.modules[moduleIndex] as any).title = updateData.moduleTitle;
    }
    if (updateData.description !== undefined) {
      course.modules[moduleIndex].description = updateData.description;
    }

    await course.save();
    return serializeCourse(course);
  }

  static async deleteModule(courseId: string, moduleId: string) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    course.modules = course.modules.filter((m: any) => m.moduleId !== moduleId);
    await course.save();
    return serializeCourse(course);
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
        (mod as any).order = index + 1;
        reordered.push(mod);
      }
    });

    course.modules = reordered as any;
    await course.save();
    return serializeCourse(course);
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
    const title = lessonData.title || lessonData.lectureTitle || 'Untitled Lesson';
    const videoUrl = lessonData.videoUrl || lessonData.lectureUrl || '';
    const duration = Number(lessonData.duration || lessonData.lectureDuration || 0);
    const isPreview = Boolean(lessonData.isPreview ?? lessonData.isPreviewFree ?? false);

    const newLesson = {
      lessonId: new Date().getTime().toString(),
      title,
      description: lessonData.description || '',
      videoUrl,
      duration,
      order,
      isPreview,
      resources: lessonData.resources || [],
      lectureId: new Date().getTime().toString(),
      lectureTitle: title,
      lectureDuration: duration,
      lectureUrl: videoUrl,
      isPreviewFree: isPreview,
      lectureOrder: order,
    };

    mod.lessons.push(newLesson as any);
    await course.save();
    return serializeCourse(course);
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
        if (lessonData.title) les.title = lessonData.title;
        if (lessonData.lectureTitle) les.lectureTitle = lessonData.lectureTitle;
        if (lessonData.description !== undefined) les.description = lessonData.description;
        if (lessonData.videoUrl) les.videoUrl = lessonData.videoUrl;
        if (lessonData.lectureUrl) les.lectureUrl = lessonData.lectureUrl;
        if (lessonData.duration !== undefined) les.duration = Number(lessonData.duration);
        if (lessonData.lectureDuration !== undefined) les.lectureDuration = Number(lessonData.lectureDuration);
        if (lessonData.isPreview !== undefined) les.isPreview = Boolean(lessonData.isPreview);
        if (lessonData.isPreviewFree !== undefined) les.isPreviewFree = Boolean(lessonData.isPreviewFree);
        if (lessonData.resources) les.resources = lessonData.resources;
        foundLesson = true;
        break;
      }
    }

    if (!foundLesson) {
      throw new ApiError(404, 'Lesson not found');
    }

    await course.save();
    return serializeCourse(course);
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
    return serializeCourse(course);
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
        les.lectureOrder = index + 1;
        reordered.push(les);
      }
    });

    mod.lessons = reordered as any;
    await course.save();
    return serializeCourse(course);
  }

  static async updateRoadmap(courseId: string, roadmap: any[]) {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found');
    }

    course.roadmap = roadmap;
    await course.save();
    return serializeCourse(course);
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
