import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import UserPlan from "../models/user.plan.model.js";
import UserUsage from "../models/user.usage.model.js";
import UserLog from "../models/user.log.model.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/jwt.util.js";

export const loginUser = async ({ emailMobile, password }) => {
  if ([emailMobile, password].some((field) => field?.trim() === "")) {
    throw new Error("All fields are required");
  }

  const user = await User.findOne({
    $or: [{ mobile: emailMobile }, { email: emailMobile }],
  });
  if (!user) {
    throw new Error("User not found. Please register to continue.");
  }

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  await User.findByIdAndUpdate(user._id, {
    isLoggedIn: true,
    lastLoginAt: new Date(),
  });

  const loggedInUser = await User.findById(user._id)
    .select(
      "_id name email mobile role isActive credits avatar isEmailVerified isMobileVerified",
    )
    .lean();

  const defaultUserPlan = {
    purchasedCredits: 0,
    remainingCredits: 0,
    status: null,
    expiresAt: null,
    createdAt: null,
    planId: {
      code: "new",
    },
  };

  const defaultUsage = {
    imagesGenerated: 0,
    videosGenerated: 0,
    creditsConsumed: 0,
  };

  const plan = await UserPlan.findOne({ userId: loggedInUser._id })
    .populate("planId", "code")
    .lean();
  const usage = await UserUsage.findOne({ userId: loggedInUser._id })
    .select("imagesGenerated videosGenerated creditsConsumed")
    .lean();

  loggedInUser.availableCredits = plan?.remainingCredits ?? 0;
  loggedInUser.memberShipStatus = plan?.planId?.code ?? "new";

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  return {
    user: loggedInUser,
    plan: { ...defaultUserPlan, ...plan },
    usage: usage ?? defaultUsage,
    accessToken,
    refreshToken,
  };
};

export const updateUserPassword = async (req) => {
  const { userId, currentPassword, newPassword } = req.body;
  if (
    [userId, currentPassword, newPassword].some((field) => field?.trim() === "")
  ) {
    throw new Error("All fields are required");
  }

  if (currentPassword === newPassword) {
    throw new Error("New password must be different from current password");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordCorrect) {
    throw new Error("Current password is is not correct");
  }

  user.password = newPassword;
  await user.save();

  await UserLog.create({
    userId,
    action: "PASSWORD_CHANGED",
    changes: [
      {
        field: "password",
        oldValue: "",
        newValue: "",
      },
    ],
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
    performedBy: userId,
  });
};