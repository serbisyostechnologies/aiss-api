import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    subject: {
      type: String,
      trim: true,
      default: "General Inquiry",
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["new", "in-progress", "resolved"],
      default: "new",
    },

    from: {
      type: String,
      enum: ["Website", "Android", "Apple"],
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    isReplied: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Contact", contactSchema);