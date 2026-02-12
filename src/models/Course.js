import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String, // e.g., 'Mastering', 'Transitioning'
    },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
    },
    totalProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    modules: [
      {
        moduleTitle: { type: String, required: true },
        subModules: [
          {
            subTitle: { type: String, required: true },
            explanation: { type: String }, // Detailed theory from Gemini
            examples: { type: String }, // Practical examples from Gemini
            youtubeQuery: { type: String }, // Search query for YouTube video
            videoUrl: { type: String }, // YouTube URL
            videoId: { type: String }, // YouTube Video ID
            isCompleted: {
              type: Boolean,
              default: false,
            },
            duration: String,
          },
        ],
        quiz: [
          {
            question: { type: String, required: true },
            options: [{ type: String, required: true }],
            correctAnswer: { type: String, required: true },
          },
        ],
        moduleScore: { type: Number, default: 0 },
        isModuleCompleted: { type: Boolean, default: false },
      },
    ],
    roleContext: {
      type: String, // The role this course is related to
    },
    thumbnail: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
