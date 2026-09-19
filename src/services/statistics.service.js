import Generation from "../models/generation.model.js";
import mongoose from "mongoose";

export const getUserProfileStats = async ({ userId }) => {
  if (!userId?.trim()) {
    return "Unauthorized access.";
  }

  const stats = await Generation.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        status: "completed",
      },
    },
    {
      $group: {
        _id: {
          type: "$type",
          operation: "$operation",
        },
        count: {
          $sum: 1,
        },
      },
    },
  ]);
  return stats;
};

export const getUserTransactionHisotry = async ({ userId, days }) => {
  const FILTERS = {
    15: () => {
      const d = new Date();
      d.setDate(d.getDate() - 15);
      return d;
    },
    30: () => {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return d;
    },
    90: () => {
      const d = new Date();
      d.setDate(d.getDate() - 90);
      return d;
    },
    180: () => {
      const d = new Date();
      d.setDate(d.getDate() - 180);
      return d;
    },
    365: () => {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 1);
      return d;
    },
    730: () => {
      const d = new Date();
      d.setFullYear(d.getFullYear() - 2);
      return d;
    },
  };

  const query = { userId };

  if (days !== "All" && FILTERS[days]) {
    query.createdAt = {
      $gte: FILTERS[days](),
    };
  }

  const generations = await Generation.find(query)
    .sort({ createdAt: -1 })
    .select("type operation creditsUsed status createdAt result prompt")
    .lean();

  const history = generations.map((item) => ({
    id: item._id,
    title: `AI ${item.type.charAt(0).toUpperCase() + item.type.slice(1)} ${
      item.operation.charAt(0).toUpperCase() + item.operation.slice(1)
    }`,
    description: getDescription(item),
    credits: `-${item.creditsUsed} Credits`,
    status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    date: formatDateTime(item.createdAt),
    result: item.result
  }));

  return history;
};

export const formatDateTime = (date) => {
  const d = new Date(date);

  const datePart = d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timePart = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return `${datePart} • ${timePart}`;
};

const getDescription = (item) => {
  switch (`${item.type}_${item.operation}`) {
    case "image_create":
      return "Generated Image";

    case "image_edit":
      return "Edited Image";

    case "image_collage":
      return "Created Image Collage";

    case "image_analyze":
      return "Analyzed Image";

    case "video_create":
      return "Generated Video";

    case "video_edit":
      return "Edited Video";

    case "video_analyze":
      return "Analyzed Video";

    case "prompt_create":
      return "Generated AI Prompt";

    default:
      return item.operation;
  }
};