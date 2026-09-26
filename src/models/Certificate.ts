import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICertificate {
  studentId: mongoose.Types.ObjectId | string;
  courseId: mongoose.Types.ObjectId | string;
  certificateId: string;
  issueDate: Date;
  verificationCode: string;
  pdfUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICertificateDocument extends ICertificate, Document {}

const certificateSchema = new Schema<ICertificateDocument>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
    },
    verificationCode: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    pdfUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound Unique Index: One official certificate per student & course
certificateSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

export const Certificate: Model<ICertificateDocument> =
  (mongoose.models.Certificate as Model<ICertificateDocument>) ||
  mongoose.model<ICertificateDocument>('Certificate', certificateSchema);

export default Certificate;
