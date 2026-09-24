import express from 'express';
import { generatePrompt, generateImage, editImage, createImageCollage, generateVideo } from "../controllers/serbisyos-ai.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/generate-prompt', authMiddleware, generatePrompt);
router.post('/generate-image', authMiddleware, generateImage);
router.route("/edit-image").post(authMiddleware, upload.fields([{ name: "image", maxCount: 1,}]), editImage);
router.route("/create-image-collage").post(authMiddleware, upload.fields([{ name: "images", maxCount: 10,}]), createImageCollage);
router.post('/generate-video', authMiddleware, generateVideo);

export default router;