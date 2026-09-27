import mongoose, { Schema, Model } from 'mongoose';
import { ICourse, ICourseDocument } from './course.types.js';
import { slugify } from '../../utils/slugify.js';

const resourceSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const embeddedLessonSchema = new Schema(
  {
    lessonId: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    videoUrl: { type: String, default: '', trim: true },
    duration: { type: Number, default: 0, min: 0 },
    resources: [resourceSchema],
    order: { type: Number, required: true, default: 0 },
    isPreview: { type: Boolean, default: false },

    // Dual compatibility mappings
    lectureId: { type: String },
    lectureTitle: { type: String },
    lectureDuration: { type: Number },
    lectureUrl: { type: String },
    isPreviewFree: { type: Boolean },
    lectureOrder: { type: Number },
  },
  { _id: false }
);

const moduleSchema = new Schema(
  {
    moduleId: { type: String, required: true, default: () => new mongoose.Types.ObjectId().toString() },
    moduleTitle: { type: String, required: true, trim: true },
    title: { type: String, trim: true },
    moduleOrder: { type: Number, required: true, default: 0 },
    order: { type: Number, default: 0 },
    description: { type: String, default: '', trim: true },
    lessons: [embeddedLessonSchema],
  },
  { _id: false }
);

const roadmapItemSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    order: { type: Number, required: true, default: 0 },
  },
  { _id: false }
);

const courseSchema = new Schema<ICourseDocument>(
  {
    courseTitle: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    courseDescription: { type: String, required: true },
    courseThumbnail: { type: String, default: '' },
    category: { type: String, default: 'Programming', trim: true, index: true },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'Beginner',
      index: true,
    },
    language: { type: String, default: 'English', trim: true },
    coursePrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    duration: { type: String, default: '0 hours' },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
    approvalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'archived'],
      default: 'approved',
      index: true,
    },
    rejectionReason: { type: String, default: '' },
    isPublished: { type: Boolean, default: true, index: true },

    educator: { type: String, ref: 'User', required: true, index: true },

    learningObjectives: { type: [String], default: [] },
    prerequisites: { type: [String], default: [] },
    skills: { type: [String], default: [], index: true },

    roadmap: [roadmapItemSchema],
    modules: [moduleSchema],

    courseRatings: [
      {
        userId: { type: String },
        rating: { type: Number, min: 1, max: 5 },
      },
    ],
    enrolledStudents: [
      {
        type: String,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
    minimize: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Bidirectional Data Model Synchronization hook
courseSchema.pre('validate', function (this: any, next) {
  // 1. Title & Slug
  if (!this.courseTitle && this.title) {
    this.courseTitle = this.title;
  }
  if (!this.slug && this.courseTitle) {
    this.slug = slugify(this.courseTitle);
  }

  // 2. Description
  if (!this.courseDescription && this.description) {
    this.courseDescription = this.description;
  }

  // 3. Thumbnail
  if (!this.courseThumbnail && this.thumbnail) {
    this.courseThumbnail = this.thumbnail;
  }

  // 4. Price
  if (this.coursePrice === undefined && this.price !== undefined) {
    this.coursePrice = Number(this.price) || 0;
  }

  // 5. Prerequisites / Requirements
  if (this.requirements && (!this.prerequisites || this.prerequisites.length === 0)) {
    this.prerequisites = Array.isArray(this.requirements) ? this.requirements : [this.requirements];
  }

  // 6. Publication Status Harmonization
  if (this.status === 'published') {
    this.isPublished = true;
  } else if (this.isPublished === false && this.status === 'published') {
    this.status = 'draft';
  }

  // 7. Course Content -> Modules Synchronization
  if (Array.isArray(this.courseContent) && this.courseContent.length > 0 && (!this.modules || this.modules.length === 0)) {
    this.modules = this.courseContent.map((ch: any, idx: number) => ({
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
        lectureId: lec.lectureId || lec.lessonId || String(lIdx + 1),
        lectureTitle: lec.lectureTitle || lec.title || `Lesson ${lIdx + 1}`,
        lectureDuration: Number(lec.lectureDuration || lec.duration || 0),
        lectureUrl: lec.lectureUrl || lec.videoUrl || '',
        isPreviewFree: Boolean(lec.isPreviewFree ?? lec.isPreview ?? false),
        lectureOrder: lec.lectureOrder || lec.order || lIdx + 1,
      })),
    }));
  }

  // 8. Ensure modules have title, order and dual lesson attributes
  if (Array.isArray(this.modules)) {
    this.modules.forEach((mod: any, mIdx: number) => {
      if (!mod.moduleTitle && mod.title) mod.moduleTitle = mod.title;
      if (!mod.title && mod.moduleTitle) mod.title = mod.moduleTitle;
      if (!mod.moduleOrder && mod.order) mod.moduleOrder = mod.order;
      if (!mod.order && mod.moduleOrder) mod.order = mod.moduleOrder;
      if (!mod.moduleId) mod.moduleId = String(mIdx + 1);

      if (Array.isArray(mod.lessons)) {
        mod.lessons.forEach((les: any, lIdx: number) => {
          if (!les.title && les.lectureTitle) les.title = les.lectureTitle;
          if (!les.lectureTitle && les.title) les.lectureTitle = les.title;
          if (!les.videoUrl && les.lectureUrl) les.videoUrl = les.lectureUrl;
          if (!les.lectureUrl && les.videoUrl) les.lectureUrl = les.videoUrl;
          if (les.duration === undefined && les.lectureDuration !== undefined) les.duration = les.lectureDuration;
          if (les.lectureDuration === undefined && les.duration !== undefined) les.lectureDuration = les.duration;
          if (les.isPreview === undefined && les.isPreviewFree !== undefined) les.isPreview = les.isPreviewFree;
          if (les.isPreviewFree === undefined && les.isPreview !== undefined) les.isPreviewFree = les.isPreview;
          if (les.order === undefined && les.lectureOrder !== undefined) les.order = les.lectureOrder;
          if (les.lectureOrder === undefined && les.order !== undefined) les.lectureOrder = les.order;
          if (!les.lessonId) les.lessonId = les.lectureId || String(lIdx + 1);
          if (!les.lectureId) les.lectureId = les.lessonId;
        });
      }
    });
  }

  next();
});

// VIRTUAL GETTERS & ALIASES

courseSchema.virtual('title').get(function (this: ICourseDocument) {
  return this.courseTitle;
});

courseSchema.virtual('description').get(function (this: ICourseDocument) {
  return this.courseDescription;
});

courseSchema.virtual('thumbnail').get(function (this: ICourseDocument) {
  return this.courseThumbnail;
});

courseSchema.virtual('price').get(function (this: ICourseDocument) {
  return this.coursePrice;
});

courseSchema.virtual('discountPrice').get(function (this: ICourseDocument) {
  if (!this.coursePrice) return 0;
  return Number((this.coursePrice - ((this.discount || 0) * this.coursePrice) / 100).toFixed(2));
});

courseSchema.virtual('instructorId').get(function (this: ICourseDocument) {
  return this.educator;
});

courseSchema.virtual('instructor').get(function (this: ICourseDocument) {
  return this.educator;
});

courseSchema.virtual('requirements').get(function (this: ICourseDocument) {
  return this.prerequisites || [];
});

courseSchema.virtual('rating').get(function (this: ICourseDocument) {
  if (!this.courseRatings || this.courseRatings.length === 0) return 4.8;
  const sum = this.courseRatings.reduce((acc, curr) => acc + (curr.rating || 5), 0);
  return Number((sum / this.courseRatings.length).toFixed(1));
});

courseSchema.virtual('students').get(function (this: ICourseDocument) {
  return this.enrolledStudents ? this.enrolledStudents.length : 0;
});

courseSchema.virtual('sections').get(function (this: ICourseDocument) {
  return this.modules;
});

courseSchema.virtual('courseContent').get(function (this: ICourseDocument) {
  if (!this.modules) return [];
  return this.modules.map((mod: any, mIdx: number) => ({
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
    })),
  }));
});

courseSchema.index({ status: 1, category: 1, level: 1 });
courseSchema.index({ educator: 1, status: 1 });
courseSchema.index({ courseTitle: 'text', courseDescription: 'text', skills: 'text' });

export const Course: Model<ICourseDocument> =
  (mongoose.models.Course as Model<ICourseDocument>) ||
  mongoose.model<ICourseDocument>('Course', courseSchema);

export { ICourse, ICourseDocument };
export default Course;
