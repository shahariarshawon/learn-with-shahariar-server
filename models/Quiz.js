import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    chapterId: {
      type: String,
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    questions: [
      {
        question: {
          type: String,
          required: true,
          trim: true,
        },
        options: {
          type: [String],
          required: true,
          validate: {
            validator: function (arr) {
              return arr.length === 4 && arr.every((opt) => opt.trim() !== "");
            },
            message: "Each question must have 4 options",
          },
        },
        answer: {
          type: Number,
          required: true,
          min: 0,
          max: 3,
        },
      },
    ],
  },
  { timestamps: true }
);

// one quiz per course chapter
quizSchema.index({ courseId: 1, chapterId: 1 }, { unique: true });

export const Quiz = mongoose.model("Quiz", quizSchema);