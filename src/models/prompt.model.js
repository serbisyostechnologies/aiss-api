import mongoose from "mongoose";

const PromptSchema = new mongoose.Schema(
  {
    prompt: {
      type: [String],
      required: true,
      default: [],
    },
    occasion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Occasion",
      required: true,
    },
    operation: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Prompt", PromptSchema);
