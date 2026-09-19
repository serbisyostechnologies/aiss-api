import express from 'express';
import { getProfileStats, getTransactionHisotry } from '../controllers/statistics.controller.js';

const router = express.Router();

router.post('/get-profile-stats', getProfileStats);
router.post('/get-transaction-history', getTransactionHisotry);

export default router;