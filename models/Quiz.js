import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  courseId: { type: String, required: true },
  title: { type: String, required: true },

  questions: [
    {
      question: String,
      options: [String],
      answer: Number,
    },
  ],
});

export const Quiz = mongoose.model("Quiz", quizSchema);