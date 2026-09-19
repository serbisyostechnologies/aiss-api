import mongoose from 'mongoose';

const creditTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    type: {
      type: String,
      enum: [
        'purchase',
        'image_generation',
        'video_generation',
        'refund',
        'adjustment',
      ],
      required: true,
    },

    credits: {
      type: Number,
      required: true,
    },

    balanceBefore: Number,

    balanceAfter: Number,

    referenceId: String,
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model('CreditTransaction', creditTransactionSchema);