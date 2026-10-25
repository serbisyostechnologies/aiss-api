import mongoose from "mongoose";

const occasionSchema = new mongoose.Schema(
  {
    state: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "State",
        required: true,
      },
    ],
    month: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Month",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model("Occasion", occasionSchema);