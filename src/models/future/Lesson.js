import mongoose from 'mongoose';

const lessonSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    chapterId: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    duration: { type: Number, default: 0 },
    videoUrl: { type: String, default: '' },
    content: { type: String, default: '' },
    isPreviewFree: { type: Boolean, default: false },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

export const Lesson = mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);
export default Lesson;
