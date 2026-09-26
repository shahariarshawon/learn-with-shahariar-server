import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const aiConversationSchema = new mongoose.Schema(
  {
    userId: { type: String, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
    title: { type: String, default: 'Study Assistant Chat' },
    messages: [messageSchema],
  },
  { timestamps: true }
);

export const AIConversation =
  mongoose.models.AIConversation || mongoose.model('AIConversation', aiConversationSchema);
export default AIConversation;
