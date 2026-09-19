import {
  sendEmailOtp,
  verifyEmailOtp,
  sendMobileOtp,
  verifyMobileOtp
} from "../services/otp.service.js";

export const sendOtp = async (req, res) => {
  try {
    await sendEmailOtp(req.body);
    res.status(201).json({ success: true, message: 'Email otp sent successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    await verifyEmailOtp(req.body);
    res.status(201).json({ success: true, message: 'Email otp verified successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const sendMobOtp = async (req, res) => {
  try {
    const response = await sendMobileOtp(req.body);
    res.status(201).json({ success: response.Status, message: 'Mobile otp sent successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const verifyMobOtp = async (req, res) => {
  try {
    await verifyMobileOtp(req.body);
    res.status(201).json({ success: true, message: 'Mobile otp verified successfully' });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};