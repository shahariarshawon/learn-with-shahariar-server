import mongoose, { Schema, Model } from 'mongoose';
import { IEnrollmentDocument } from '../../types/future.types.js';

const enrollmentSchema = new Schema<IEnrollmentDocument>(
  {
    userId: { type: String, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    enrolledAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['active', 'completed', 'cancelled'],
      default: 'active',
    },
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });

export const Enrollment: Model<IEnrollmentDocument> =
  (mongoose.models.Enrollment as Model<IEnrollmentDocument>) ||
  mongoose.model<IEnrollmentDocument>('Enrollment', enrollmentSchema);

export default Enrollment;
