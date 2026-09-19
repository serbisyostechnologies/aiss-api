import mongoose from 'mongoose';

const userLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    action: {
      type: String,
      required: true,
      enum: [
        'PROFILE_UPDATED',
        'EMAIL_UPDATED',
        'MOBILE_UPDATED',
        'PASSWORD_CHANGED',
        'AVATAR_UPDATED',
        'AVATAR_REMOVED',
        'PLAN_CHANGED',
        'CREDITS_ADDED',
        'CREDITS_DEDUCTED',
        'ACCOUNT_DEACTIVATED',
        'ACCOUNT_ACTIVATED',
      ],
    },

    changes: [
      {
        field: {
          type: String,
          required: true,
        },

        oldValue: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },

        newValue: {
          type: mongoose.Schema.Types.Mixed,
          default: null,
        },
      },
    ],

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },

    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model('UserLog', userLogSchema);