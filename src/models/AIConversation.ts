import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAIMessage {
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp?: Date;
}

export interface IAIConversation {
  userId: mongoose.Types.ObjectId | string;
  courseId?: mongoose.Types.ObjectId | string;
  lessonId?: string;
  messages: IAIMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IAIConversationDocument extends IAIConversation, Document {}

const messageSchema = new Schema<IAIMessage>(
  {
    sender: {
      type: String,
      enum: ['user', 'assistant', 'system'],
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const aiConversationSchema = new Schema<IAIConversationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      index: true,
    },
    lessonId: {
      type: String,
      index: true,
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

aiConversationSchema.index({ userId: 1, courseId: 1 });

export const AIConversation: Model<IAIConversationDocument> =
  (mongoose.models.AIConversation as Model<IAIConversationDocument>) ||
  mongoose.model<IAIConversationDocument>('AIConversation', aiConversationSchema);

export default AIConversation;
