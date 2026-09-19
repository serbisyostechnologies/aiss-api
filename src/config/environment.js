import dotenv from 'dotenv';

dotenv.config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
});

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 8000,
  HOST: process.env.HOST,

  MONGO_URI: process.env.MONGO_URI,
  DB_NAME: process.env.DB_NAME,

  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ALGORITHM: process.env.JWT_ALGORITHM,
  ACCESS_TOKEN_EXPIRE_MINUTES: process.env.ACCESS_TOKEN_EXPIRE_MINUTES,

  OPENAI_API_KEY: process.env.OPENAI_API_KEY,

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID,
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  REDIS_URL: process.env.REDIS_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  GPT_CREATE_MODEL: process.env.GPT_CREATE_MODEL,
  SMS_OTP_TEMPLATE: process.env.SMS_OTP_TEMPLATE,
  SMS_OTP_API_KEY: process.env.SMS_OTP_API_KEY,
  OTP_EXPIRE_MINUTES: process.env.OTP_EXPIRE_MINUTES,
  IMAGE_MINI_MODEL: process.env.IMAGE_MINI_MODEL,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_IMAGE_MODEL: process.env.GEMINI_IMAGE_MODEL,
  GEMINI_PROMPT_MODEL: process.env.GEMINI_PROMPT_MODEL,
  GEMINI_PROMPT_MODEL_PRO: process.env.GEMINI_PROMPT_MODEL_PRO,
  GEMINI_IMAGE_MODEL_FLASH: process.env.GEMINI_IMAGE_MODEL_FLASH
};

const requiredVars = [
  'MONGO_URI',
  'JWT_ACCESS_SECRET',
];

requiredVars.forEach((key) => {
  if (!env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

export default env;