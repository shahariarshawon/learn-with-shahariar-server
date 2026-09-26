import mongoose from 'mongoose';

const lectureSchema = new mongoose.Schema(
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

const chapterSchema = new mongoose.Schema(
  {
    chapterId: { type: String, required: true },
    chapterOrder: { type: Number, required: true },
    chapterTitle: { type: String, required: true },
    chapterContent: [lectureSchema],
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    // LMS core fields with legacy support
    courseTitle: { type: String, required: true, trim: true },
    courseDescription: { type: String, required: true },
    courseThumbnail: { type: String, default: '' },
    coursePrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },
    isPublished: { type: Boolean, default: true },

    // Extended professional LMS fields
    category: { type: String, default: 'Web Development', trim: true },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'Beginner',
    },
    duration: { type: String, default: '0 hours' },
    requirements: { type: [String], default: [] },
    learningObjectives: { type: [String], default: [] },

    // Course structure
    courseContent: [chapterSchema],

    // Educator / Instructor reference
    educator: { type: String, ref: 'User', required: true },

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

// Virtual properties for standardized naming
courseSchema.virtual('title').get(function () {
  return this.courseTitle;
});

courseSchema.virtual('description').get(function () {
  return this.courseDescription;
});

courseSchema.virtual('thumbnail').get(function () {
  return this.courseThumbnail;
});

courseSchema.virtual('price').get(function () {
  return this.coursePrice;
});

courseSchema.virtual('instructor').get(function () {
  return this.educator;
});

courseSchema.virtual('sections').get(function () {
  return this.courseContent;
});

export const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);
export default Course;
