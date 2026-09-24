import express from 'express';
import { createPlan } from '../controllers/plan.controller.js';
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/create-new-plan', authMiddleware, createPlan);

export default router;