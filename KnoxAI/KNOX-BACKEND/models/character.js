import mongoose from "mongoose";

const characterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    avatar: {
      type: String, // image URL
      required: true,
    },

    description: {
      type: String,
      required: true,
    },
    greeting: {
      type: String,
      required: true,
    },

    personalityPrompt: {
      type: String,
      required: true,
    },

    creator: {
      type: String,
      ref: "User", // reference to User model
      required: true,
    },

    category: {
      type: String,
      default: null,
    },

    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Character", characterSchema);
