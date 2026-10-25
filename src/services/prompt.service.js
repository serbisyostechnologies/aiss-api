import Prompt from "../models/prompt.model.js";
import State from "../models/state.model.js";
import Occasion from "../models/occasion.model.js";

export const createPrompts = async (data) => {
  try {
    const prompts = Array.isArray(data) ? data : [data];

    const normalizedPrompts = prompts.map((item) => ({
      prompt: Array.isArray(item.prompt)
        ? [...new Set(item.prompt.map((p) => p.trim()).filter(Boolean))]
        : [],
      occasion: item.occasion?.trim(),
      operation: item.operation?.trim(),
      isActive: item.isActive ?? true,
    }));

    const uniquePrompts = [
      ...new Map(
        normalizedPrompts.map((item) => [
          JSON.stringify([item.prompt, item.occasion, item.operation]),
          item,
        ]),
      ).values(),
    ];

    if (uniquePrompts.length === 0) {
      return {
        inserted: 0,
        updated: 0,
        skipped: 0,
      };
    }

    const result = await Prompt.bulkWrite(
      uniquePrompts.map((item) => ({
        updateOne: {
          filter: {
            prompt: item.prompt,
            occasion: item.occasion,
            operation: item.operation,
          },
          update: {
            $set: item,
          },
          upsert: true,
        },
      })),
      { ordered: false },
    );

    return {
      inserted: result.upsertedCount,
      updated: result.modifiedCount,
      skipped: prompts.length - result.upsertedCount - result.modifiedCount,
    };
  } catch (error) {
    console.error("Create prompt error:", error);
    throw new Error("Failed to upload data. Please try again later");
  }
};

export const getAllPrompts = async () => {
  return await Prompt.find()
    .select("_id prompt")
    .sort({ createdAt: -1, prompt: 1 });
};

export const getPrompts = async ({ state, operation }) => {
  let stateId = null;

  if (state) {
    const stateData = await State.findOne({
      name: state,
    }).select("_id");

    if (!stateData) {
      throw new Error("State not found");
    }

    stateId = stateData._id;
  }

  const stateFilter = stateId
    ? {
        $or: [{ state: stateId }, { state: { $size: 0 } }],
      }
    : {
        state: { $size: 0 },
      };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const before = await Occasion.find({
    ...stateFilter,
    date: { $lt: today },
  })
    .sort({ date: -1 })
    .limit(3)
    .select("_id name date");

  const after = await Occasion.find({
    ...stateFilter,
    date: { $gte: today },
  })
    .sort({ date: 1 })
    .limit(3)
    .select("_id name date");

  const occasionIds = [...before, ...after].map((occasion) => occasion._id);

  return await Prompt.aggregate([
    {
      $match: {
        occasion: { $in: occasionIds },
        operation,
        isActive: true,
      },
    },
    {
      $lookup: {
        from: "occasions", // Use your actual MongoDB collection name
        localField: "occasion",
        foreignField: "_id",
        as: "occasion",
      },
    },
    { $unwind: "$occasion" },
    {
      $sort: {
        "occasion.date": 1, // Ascending: earliest date first
      },
    },
    {
      $project: {
        prompt: 1,
        occasion: {
          name: "$occasion.name",
          id: "$occasion._id"
        },
      },
    },
  ]);
};