import express from 'express';
import { createOrder, verifyOrder } from '../controllers/order.controller.js';

const router = express.Router();

router.post('/create-payment-order', createOrder);
router.post('/verify-payment-order', verifyOrder);

export default router;