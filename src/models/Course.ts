import mongoose, { Schema, Model } from 'mongoose';
import { ICourseDocument } from '../types/course.types.js';
import { slugify } from '../utils/slugify.js';

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

    // Legacy field compatibility aliases
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
    moduleOrder: { type: Number, required: true, default: 0 },
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
    // Basic Information
    courseTitle: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    courseDescription: { type: String, required: true },
    courseThumbnail: { type: String, default: '' },
    category: { type: String, default: 'Web Development', trim: true, index: true },
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

    // Instructor reference
    educator: { type: String, ref: 'User', required: true, index: true },

    // Learning Information
    learningObjectives: { type: [String], default: [] },
    prerequisites: { type: [String], default: [] },
    skills: { type: [String], default: [], index: true },

    // Roadmap & Syllabus Structure
    roadmap: [roadmapItemSchema],
    modules: [moduleSchema],

    // Ratings & Enrolled students
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

// Pre-validate hook: auto-generate unique slug if missing
courseSchema.pre('validate', function (this: ICourseDocument, next) {
  if (!this.slug && this.courseTitle) {
    this.slug = slugify(this.courseTitle);
  }
  // Sync status and isPublished boolean
  if ((this.status as string) === 'published') {
    this.isPublished = true;
  } else if (this.isPublished === false && (this.status as string) === 'published') {
    this.status = 'draft';
  }
  next();
});

// Virtual property aliases for standardized naming
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

courseSchema.virtual('sections').get(function (this: ICourseDocument) {
  return this.modules;
});

// Legacy backward-compatibility virtual for courseContent
courseSchema.virtual('courseContent').get(function (this: ICourseDocument) {
  if (!this.modules) return [];
  return this.modules.map((mod) => ({
    chapterId: mod.moduleId,
    chapterOrder: mod.moduleOrder,
    chapterTitle: mod.moduleTitle,
    chapterContent: (mod.lessons || []).map((les: any) => ({
      lectureId: les.lessonId || les._id?.toString() || 'les_1',
      lectureTitle: les.title || les.lectureTitle || '',
      lectureDuration: les.duration || les.lectureDuration || 0,
      lectureUrl: les.videoUrl || les.lectureUrl || '',
      isPreviewFree: les.isPreview ?? les.isPreviewFree ?? true,
      lectureOrder: les.order || les.lectureOrder || 0,
    })),
  }));
});

// Compound Indexes for fast catalogue querying and filtering
courseSchema.index({ status: 1, category: 1, level: 1 });
courseSchema.index({ educator: 1, status: 1 });
courseSchema.index({ courseTitle: 'text', courseDescription: 'text', skills: 'text' });

export const Course: Model<ICourseDocument> =
  (mongoose.models.Course as Model<ICourseDocument>) ||
  mongoose.model<ICourseDocument>('Course', courseSchema);

export default Course;
