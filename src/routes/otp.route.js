import express from "express";
import {
  sendOtp,
  verifyOtp,
  sendMobOtp,
  verifyMobOtp
} from "../controllers/otp.controller.js";

const router = express.Router();

router.post("/send-email-otp", sendOtp);
router.post("/verify-email-otp", verifyOtp);
router.post("/send-mobile-otp", sendMobOtp);
router.post("/verify-mobile-otp", verifyMobOtp);

export default router;