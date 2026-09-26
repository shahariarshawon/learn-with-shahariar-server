import mongoose from 'mongoose';

const certificateSchema = new mongoose.Schema(
  {
    userId: { type: String, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    certificateNumber: { type: String, unique: true, required: true },
    issueDate: { type: Date, default: Date.now },
    pdfUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Certificate =
  mongoose.models.Certificate || mongoose.model('Certificate', certificateSchema);
export default Certificate;
