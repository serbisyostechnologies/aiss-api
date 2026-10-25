import Prompt from "../models/prompt.model.js";

export const createPrompt = async (data) => {
  try {
    const prompts = Array.isArray(data) ? data : [data];

    const uniquePrompts = [
      ...new Map(
        prompts.map((item) => [
          JSON.stringify([
            item.prompt?.trim(),
            item.occasion?.trim(),
            Number(item.month),
            item.region?.trim(),
          ]),
          {
            ...item,
            prompt: item.prompt?.trim(),
            occasion: item.occasion?.trim(),
            month: Number(item.month),
            region: item.region?.trim(),
          },
        ]),
      ).values(),
    ];

    const newPrompts = [];

    for (const item of uniquePrompts) {
      const exists = await Prompt.exists({
        prompt: item.prompt,
        occasion: item.occasion,
        month: item.month,
        region: item.region,
      });

      if (!exists) {
        newPrompts.push(item);
      }
    }

    if (newPrompts.length === 0) {
      return {
        inserted: [],
        skipped: uniquePrompts.length,
      };
    }

    const inserted = await Prompt.insertMany(newPrompts, {
      ordered: false,
    });

    return {
      inserted,
      skipped: prompts.length - inserted.length,
    };
  } catch (error) {
    throw new Error("Failed to upload data. Please try again later");
  }
};

export const getAllPrompts = async () => {
  return await Prompt.find()
    .select("_id prompt region occasion month operation isActive createdAt")
    .sort({ createdAt: -1, operation: 1 });
};

export const getOccassionPrompts = async ({ occasion, month, region }) => {
  const query = {};

  if (occasion) {
    query.occasion = occasion;
  }

  if (region) {
    query.region = region;
  }

  if (month !== undefined) {
    query.month = Number(month);
  }

  return Prompt.find(query).select("prompt").sort({
    prompt: 1
  });
};