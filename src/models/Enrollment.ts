import mongoose, { Schema, Model } from 'mongoose';
import { IEnrollmentDocument } from '../types/enrollment.types.js';

const enrollmentSchema = new Schema<IEnrollmentDocument>(
  {
    studentId: { type: String, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    enrolledAt: { type: Date, default: Date.now },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    completedLessons: [{ type: String }],
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
  },
  { timestamps: true }
);

// Compound unique index so student cannot be enrolled twice in the same course
enrollmentSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Enrollment: Model<IEnrollmentDocument> =
  (mongoose.models.Enrollment as Model<IEnrollmentDocument>) ||
  mongoose.model<IEnrollmentDocument>('Enrollment', enrollmentSchema);

export default Enrollment;
