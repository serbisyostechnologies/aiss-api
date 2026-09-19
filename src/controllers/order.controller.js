import { createPaymentOder, verifyPaymentOder } from "../services/order.service.js";

export const createOrder = async (req, res) => {
  try {
    const { key, orderId, order } = await createPaymentOder(req.body);
    res.status(201).json({ success: true, message: 'Payment order created successfully', key, orderId, order });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: err.message });
  }
};

export const verifyOrder = async (req, res) => {
  try {
    const order = await verifyPaymentOder(req.body);
    res.status(201).json({ success: true, message: 'Payment order created successfully', order });
  } catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: err.message });
  }
};