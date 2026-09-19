import UserPlan from "../models/user.plan.model.js";
import { updateUserUsage } from "../controllers/usage.controller.js";
import Generation from "../models/generation.model.js";

export const validateUserInput = async (userId, prompt) => {
  if (!userId?.trim()) {
    return "Unauthorized access.";
  }

  if (!prompt?.trim()) {
    ("Prompt is required.");
  }
  return "";
};

export const crateUsagePlan = async (credits, userId) => {
  return await UserPlan.findOneAndUpdate(
    {
      userId,
      status: "active",
      expiresAt: { $gt: new Date() },
      remainingCredits: { $gte: credits },
    },
    {
      $inc: {
        remainingCredits: -credits,
      },
    },
    {
      returnDocument: "after",
    },
  );
};

export const createGeneration = async ({
  userId,
  type,
  operation,
  prompt = "",
  result = "",
  creditsUsed,
  model,
  duration = 0,
  usageData = {},
  status = "processing",
}) => {
  const usage = await updateUserUsage({
    userId,
    ...usageData,
    credits: creditsUsed,
    duration,
  });

  const generation = await Generation.createGeneration({
    userId,
    type,
    operation,
    prompt,
    result,
    creditsUsed,
    model,
    status,
    usage: usage._id,
  });

  return generation;
};