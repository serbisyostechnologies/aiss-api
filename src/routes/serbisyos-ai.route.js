import express from 'express';
import { generatePrompt, generateImage, editImage, createImageCollage } from "../controllers/serbisyos-ai.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = express.Router();

router.post('/generate-prompt', generatePrompt);
router.post('/generate-image', generateImage);
router.route("/edit-image").post(upload.fields([{ name: "image", maxCount: 1,}]), editImage);
router.route("/create-image-collage").post(upload.fields([{ name: "images", maxCount: 10,}]), createImageCollage);

export default router;