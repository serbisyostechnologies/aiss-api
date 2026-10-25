import express from 'express';
import authMiddleware from "../middlewares/auth.middleware.js";
import { createPrompts, getAllPrompts, getPrompts } from '../controllers/prompt.controller.js';

const router = express.Router();

router.post('/seed', authMiddleware, createPrompts);
router.get('/get-all', authMiddleware, getAllPrompts);
router.post('/get-prompts', authMiddleware, getPrompts);

export default router;