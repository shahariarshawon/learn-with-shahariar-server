import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IEmbedding {
  courseId: mongoose.Types.ObjectId | string;
  lessonId?: string;
  content: string;
  vectorId?: string;
  createdAt?: Date;
}

export interface IEmbeddingDocument extends IEmbedding, Document {}

const embeddingSchema = new Schema<IEmbeddingDocument>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },
    lessonId: {
      type: String,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    vectorId: {
      type: String,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

embeddingSchema.index({ courseId: 1, lessonId: 1 });

export const Embedding: Model<IEmbeddingDocument> =
  (mongoose.models.Embedding as Model<IEmbeddingDocument>) ||
  mongoose.model<IEmbeddingDocument>('Embedding', embeddingSchema);

export default Embedding;
