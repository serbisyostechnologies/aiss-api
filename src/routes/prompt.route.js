import express from 'express';
import authMiddleware from "../middlewares/auth.middleware.js";
import { createPrompt, getAllPrompts, getOccassionPrompts } from '../controllers/prompt.controller.js';

const router = express.Router();

router.post('/save-prompts', authMiddleware, createPrompt);
router.get('/get-all-prompts', authMiddleware, getAllPrompts);
router.post('/get-occassion-prompts', authMiddleware, getOccassionPrompts);

export default router;