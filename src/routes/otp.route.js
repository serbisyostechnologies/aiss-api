import express from "express";
import {
  sendOtp,
  verifyOtp,
  sendMobOtp,
  verifyMobOtp
} from "../controllers/otp.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/send-email-otp", authMiddleware, sendOtp);
router.post("/verify-email-otp", authMiddleware, verifyOtp);
router.post("/send-mobile-otp", authMiddleware, sendMobOtp);
router.post("/verify-mobile-otp", authMiddleware, verifyMobOtp);

export default router;