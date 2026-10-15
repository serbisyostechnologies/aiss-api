import UserPlan from "../models/user.plan.model.js";
import { updateUserUsage } from "../controllers/usage.controller.js";
import Generation from "../models/generation.model.js";
import fs from "node:fs/promises";
import path from "path";

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

export const deleteAllFiles = async (folderPath) => {
  try {
    const entries = await fs.readdir(folderPath, {
      withFileTypes: true,
    });

    await Promise.all(
      entries
        .filter((entry) => entry.isFile())
        .map((entry) => fs.unlink(path.join(folderPath, entry.name))),
    );
  } catch (error) {
    console.error("Error deleting files:", error);
    throw error;
  }
};
