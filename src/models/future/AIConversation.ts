import mongoose, { Schema, Model } from 'mongoose';
import { IAIConversationDocument } from '../../types/future.types.js';

const messageSchema = new Schema(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const aiConversationSchema = new Schema<IAIConversationDocument>(
  {
    userId: { type: String, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
    title: { type: String, default: 'Study Assistant Chat' },
    messages: [messageSchema],
  },
  { timestamps: true }
);

export const AIConversation: Model<IAIConversationDocument> =
  (mongoose.models.AIConversation as Model<IAIConversationDocument>) ||
  mongoose.model<IAIConversationDocument>('AIConversation', aiConversationSchema);

export default AIConversation;
