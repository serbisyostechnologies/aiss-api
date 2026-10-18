import User from "../models/user.model.js";
import Plan from "../models/plan.model.js";
import UserPlan from "../models/user.plan.model.js";
import UserUsage from "../models/user.usage.model.js";
import UserLog from "../models/user.log.model.js";
import Generation from "../models/generation.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";

export const registerUser = async ({ name, email, mobile, password }) => {
  if ([name, email, mobile, password].some((field) => field?.trim() === "")) {
    throw new Error("All fields are required");
  }

  const exists = await User.findOne({ $or: [{ mobile }, { email }] });
  if (exists) {
    throw new Error("User already exists. Please login to continue");
  }

  const user = await User.create({ name, email, mobile, password });

  return user;
};

export const updateLanguage = async ({ userId, code, label }) => {
  if ([userId, code, label].some((field) => field?.trim() === "")) {
    throw new Error("All fields are required");
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("Please login to update language");
  }

  user.language = {
    code: code,
    label: label,
  };
  await user.save();
};

export const updateUserPlan = async ({ userId, code }) => {
  if ([userId, code].some((field) => field?.trim() === "")) {
    throw new Error("All fields are required");
  }

  const plan = await Plan.findOne({ code }).select("_id credits code");

  const exists = await UserPlan.findOne({
    $and: [{ userId }, { planId: plan._id }],
  });
  if (exists) {
    throw new Error("You already have an active plan");
  }

  await UserPlan.updateMany(
    { userId },
    {
      $set: { status: 'inactive' },
    },
  );

  const userPlan = await UserPlan.create({
    userId,
    planId: plan._id,
    purchasedCredits: plan.credits,
    remainingCredits: plan.credits,
  });

  const user = await User.findById(userId)
    .select(
      "_id name email mobile role is_active credits avatar isEmailVerified isMobileVerified",
    )
    .lean();
  user.availableCredits = userPlan?.remainingCredits ?? 0;
  user.memberShipStatus = plan?.code ?? "new";

  if (!userPlan) {
    throw new Error("Failed to activate plan");
  }

  return {
    plan: {
      ...userPlan.toObject(),
      planName: plan.code,
    },
    user,
  };
};

export const getUserProfile = async ({ userId }) => {
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

  const [user, plan, usage] = await Promise.all([
    User.findById(userId)
      .select(
        "_id name email mobile role isActive credits avatar isEmailVerified isMobileVerified",
      )
      .lean(),

    UserPlan.findOne({ userId })
      .select(
        "purchasedCredits remainingCredits status expiresAt createdAt planId",
      )
      .populate("planId", "code")
      .lean(),

    UserUsage.findOne({ userId })
      .select("imagesGenerated videosGenerated creditsConsumed")
      .lean(),
  ]);

  user.availableCredits = plan?.remainingCredits ?? 0;
  user.memberShipStatus = plan?.planId?.code ?? "new";

  const profile = {
    user,
    plan: {
      ...defaultUserPlan,
      ...plan,
    },
    usage: usage ?? defaultUsage,
  };
  return profile;
};

export const updateProfilePhoto = async (req) => {
  const { userId } = req.body;

  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  if (!avatarLocalPath) {
    throw new Error("Profile photo file is required");
  }

  const uploadedAvatar = await uploadOnCloudinary(
    avatarLocalPath,
    "PROFILE_PHOTO",
  );

  if (!uploadedAvatar?.secure_url) {
    throw new Error("Failed to upload profile photo");
  }

  // Get old avatar and update in a single query
  const oldUser = await User.findOneAndUpdate(
    { _id: userId },
    { $set: { avatar: uploadedAvatar.secure_url } },
    {
      projection: { avatar: 1 },
      returnDocument: "before", // Returns document before update
    },
  ).lean();

  if (!oldUser) {
    throw new Error("User not found");
  }

  await UserLog.create({
    userId,
    action: "AVATAR_UPDATED",
    changes: [
      {
        field: "avatar",
        oldValue: oldUser.avatar,
        newValue: uploadedAvatar.url,
      },
    ],
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
    performedBy: userId,
  });

  return uploadedAvatar.secure_url;
};

export const removeProfilePhoto = async (req) => {
  const { userId } = req.body;
  const user = await User.findById(userId).select("avatar").lean();
  const oldAvatar = user.avatar;

  const updatedUser = await User.findByIdAndUpdate(
    { _id: userId },
    { $set: { avatar: "" } },
    { returnDocument: "after" },
  )
    .select(
      "_id name email mobile role is_active credits avatar isEmailVerified isMobileVerified",
    )
    .lean();

  await UserLog.create({
    userId,
    action: "AVATAR_REMOVED",
    changes: [
      {
        field: "avatar",
        oldValue: oldAvatar,
        newValue: "",
      },
    ],
    ipAddress: req.ip,
    userAgent: req.get("User-Agent"),
    performedBy: userId,
  });

  return updatedUser;
};

export const getCreations = async ({ userId }) => {
  const creations = await Generation.find(
    { userId: userId, type: "image" },
    { operation: 1, prompt: 1, result: 1, favorite: 1, createdAt: 1, creditsUsed: 1 },
  ).sort({ createdAt: -1 });

  return creations ?? [];
};

export const deleteCreations = async (generationIds) => {
  await Generation.deleteMany({
    _id: { $in: generationIds },
  });
};