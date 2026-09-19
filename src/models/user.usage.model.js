import mongoose from 'mongoose';

const userUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    usageDate: {
      type: Date,
      required: true,
      index: true,
    },

    imagesGenerated: {
      type: Number,
      default: 0,
    },

    videosGenerated: {
      type: Number,
      default: 0,
    },

    promptsGenerated: {
      type: Number,
      default: 0,
    },

    creditsConsumed: {
      type: Number,
      default: 0,
    },

    totalGenerationTimeSeconds: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

userUsageSchema.index(
  {
    userId: 1,
    usageDate: 1,
  },
  {
    unique: true,
  },
);

export default mongoose.model('UserUsage', userUsageSchema);