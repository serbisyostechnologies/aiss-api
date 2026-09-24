import express from 'express';
import { createOrder, verifyOrder } from '../controllers/order.controller.js';
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post('/create-payment-order', authMiddleware, createOrder);
router.post('/verify-payment-order', authMiddleware, verifyOrder);

export default router;