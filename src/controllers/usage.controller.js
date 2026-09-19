import UserUsage from "../models/user.usage.model.js";

export const updateUserUsage = async ({
  userId,
  images = 0,
  videos = 0,
  prompts = 0,
  credits = 0,
  duration = 0,
}) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return UserUsage.findOneAndUpdate(
    {
      userId,
      usageDate: today,
    },
    {
      $inc: {
        imagesGenerated: images,
        videosGenerated: videos,
        promptsGenerated: prompts,
        creditsConsumed: credits,
        totalGenerationTimeSeconds: duration,
      },
    },
    {
      upsert: true,
      returnDocument: 'after',
      setDefaultsOnInsert: true,
    },
  );
};