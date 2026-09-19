import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    emailMobile: {
      type: String,
      required: true,
      unique: true,
    },

    otp: {
      type: String,
      required: true,
    },

    otpFrom: {
        type: String
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Otp", otpSchema);