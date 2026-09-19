import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      unique: true,
      required: true,
    },

    code: {
      type: String,
      unique: true,
      required: true,
    },

    description: String,

    price: {
      type: Number,
      required: true,
    },

    credits: {
      type: Number,
      required: true,
    },

    validityDays: {
      type: Number,
      required: true,
    },

    allowed: {
      type: String,
      required: true,
    },

    oneImageCredit: Number,

    oneVideoCredit: Number,

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export default mongoose.model('Plan', planSchema);