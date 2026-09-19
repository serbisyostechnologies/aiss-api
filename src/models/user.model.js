import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      required: true,
    },

    mobile: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },

    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },

    language: {
      code: {
        type: String,
        default: "en",
      },
      label: {
        type: String,
        default: "English",
      },
    },

    password: {
      type: String,
      required: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    providerId: String,

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isMobileVerified: {
      type: Boolean,
      default: false,
    },

    isLoggedIn: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: false,
    },

    lastLoginAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return null;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);