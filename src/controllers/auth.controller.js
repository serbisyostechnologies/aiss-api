import { loginUser, updateUserPassword } from "../services/auth.service.js";
import User from "../models/user.model.js";

export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);

    const { user, accessToken, refreshToken, plan, usage } = result;

    req.session.user = user;
    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;

    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      success: true,
      message: "Login successful",
      user,
      plan,
      usage,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const { userId } = req.body;

    await User.findByIdAndUpdate(userId, {
      isLoggedIn: true,
    });

    res.clearCookie("token");

    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const updatePassword = async (req, res) => {
  try {
    await updateUserPassword(req);
    res.status(201).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};