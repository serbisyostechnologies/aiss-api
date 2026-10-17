import {
  registerUser,
  updateLanguage,
  updateUserPlan,
  getUserProfile,
  updateProfilePhoto,
  removeProfilePhoto,
  getCreations,
  deleteCreations,
} from "../services/user.service.js";

export const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updateUserLanguage = async (req, res) => {
  try {
    await updateLanguage(req.body);
    res
      .status(201)
      .json({ success: true, message: "Selected language saved successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updatePlan = async (req, res) => {
  try {
    const plan = await updateUserPlan(req.body);
    res
      .status(201)
      .json({
        user: plan.user,
        plan: plan.plan,
        success: true,
        message: "Plan activate successfully",
      });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const profile = await getUserProfile(req.body);
    res.status(201).json({ profile, success: true });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const updatePhoto = async (req, res) => {
  try {
    const avatar = await updateProfilePhoto(req);
    res
      .status(201)
      .json({
        success: true,
        message: "Profile photo updated successfully",
        avatar,
      });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const removePhoto = async (req, res) => {
  try {
    const user = await removeProfilePhoto(req);
    res
      .status(201)
      .json({
        success: true,
        message: "Profile photo removed successfully",
        user,
      });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const getUserCreations = async (req, res) => {
  try {
    const creations = await getCreations(req.body);
    res
      .status(201)
      .json({
        success: true,
        message: "User registered successfully",
        creations,
      });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const deleteUserCreations = async (req, res) => {
  try {
    const { generationIds } = req.body;

    if (!Array.isArray(generationIds) || generationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please select creations to delete",
      });
    }

    await deleteCreations(generationIds);
    res
      .status(201)
      .json({ success: true, message: "Creations deleted successfully" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
