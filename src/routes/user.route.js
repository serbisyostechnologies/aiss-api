import express from 'express';
import { register, updateUserLanguage, updatePlan, getProfile, updatePhoto, removePhoto } from '../controllers/user.controller.js';
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post('/register', register);
router.post('/update-language', updateUserLanguage);
router.post('/update-plan', updatePlan);
router.post('/get-profile', getProfile);
router.route("/upload-photo").post(upload.fields([{ name: "avatar", maxCount: 1,}]), updatePhoto);
router.post('/remove-photo', removePhoto);

export default router;