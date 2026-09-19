import mongoose from 'mongoose';

const userPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
      required: true,
    },

    purchasedCredits: {
      type: Number,
      required: true,
    },

    remainingCredits: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ['active', 'expired', 'cancelled'],
      default: 'active',
    },

    startsAt: {
      type: Date,
      required: true,
      default: Date.now
    },

    expiresAt: {
      type: Date,
      required: true,
      default: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model('UserPlan', userPlanSchema);