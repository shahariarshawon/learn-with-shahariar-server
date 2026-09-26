import mongoose, { Schema, Model } from 'mongoose';
import { ICourseDocument } from '../types/course.types.js';

const lectureSchema = new Schema(
  {
    lectureId: { type: String, required: true },
    lectureTitle: { type: String, required: true },
    lectureDuration: { type: Number, required: true },
    lectureUrl: { type: String, required: true },
    isPreviewFree: { type: Boolean, default: true },
    lectureOrder: { type: Number, required: true },
  },
  { _id: false }
);

const chapterSchema = new Schema(
  {
    chapterId: { type: String, required: true },
    chapterOrder: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    chapterContent: [lectureSchema],
  },
  { _id: false }
);

const courseSchema = new Schema<ICourseDocument>(
  {
    courseTitle: { type: String, required: true, trim: true },
    courseDescription: { type: String, required: true },
    courseThumbnail: { type: String, default: '' },
    coursePrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    isPublished: { type: Boolean, default: true },

    category: { type: String, default: 'Web Development', trim: true },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'Beginner',
    },
    duration: { type: String, default: '0 hours' },
    requirements: { type: [String], default: [] },
    learningObjectives: { type: [String], default: [] },

    courseContent: [chapterSchema],

    educator: { type: String, ref: 'User', required: true },

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

courseSchema.virtual('instructor').get(function (this: ICourseDocument) {
  return this.educator;
});

courseSchema.virtual('sections').get(function (this: ICourseDocument) {
  return this.courseContent;
});

export const Course: Model<ICourseDocument> =
  (mongoose.models.Course as Model<ICourseDocument>) ||
  mongoose.model<ICourseDocument>('Course', courseSchema);

export default Course;
