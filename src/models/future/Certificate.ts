import mongoose, { Schema, Model } from 'mongoose';
import { ICertificateDocument } from '../../types/future.types.js';

const certificateSchema = new Schema<ICertificateDocument>(
  {
    userId: { type: String, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    certificateNumber: { type: String, unique: true, required: true },
    issueDate: { type: Date, default: Date.now },
    pdfUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Certificate: Model<ICertificateDocument> =
  (mongoose.models.Certificate as Model<ICertificateDocument>) ||
  mongoose.model<ICertificateDocument>('Certificate', certificateSchema);

export default Certificate;
