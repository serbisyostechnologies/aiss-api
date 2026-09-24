import express from 'express';
import { getProfileStats, getTransactionHisotry } from '../controllers/statistics.controller.js';
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/get-profile-stats', authMiddleware, getProfileStats);
router.post('/get-transaction-history', authMiddleware, getTransactionHisotry);

export default router;