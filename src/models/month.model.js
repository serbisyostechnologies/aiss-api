import mongoose from "mongoose";

const monthSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    number: {
      type: Number,
      required: true,
      unique: true,
      min: 1,
      max: 12,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model("Month", monthSchema);