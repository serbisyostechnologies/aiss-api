import express from 'express';
import { register, updateUserLanguage, updatePlan, getProfile, updatePhoto, removePhoto, getUserCreations } from '../controllers/user.controller.js';
import { upload } from "../middlewares/multer.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/register', register);
router.post('/update-language', authMiddleware, updateUserLanguage);
router.post('/update-plan', authMiddleware, updatePlan);
router.post('/get-profile', authMiddleware, getProfile);
router.route("/upload-photo").post(authMiddleware, upload.fields([{ name: "avatar", maxCount: 1,}]), updatePhoto);
router.post('/remove-photo', authMiddleware, removePhoto);
router.post('/get-user-creations', authMiddleware, getUserCreations);

export default router;