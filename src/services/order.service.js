import Razorpay from "razorpay";
import crypto from "crypto";
import { Order } from "../models/order.model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const createPaymentOder = async ({ amount, userId }) => {
  try {
    const receipt = `rcpt_${Date.now()}`;
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt,
    });

    const payment = await Order.create({
      userId,
      amount,
      receipt,
      razorpayOrderId: razorpayOrder.id,
    });

    return {
      key: process.env.RAZORPAY_KEY_ID,
      orderId: payment._id,
      order: razorpayOrder,
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to make payment");
  }
};

export const verifyPaymentOder = async ({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) => {
  try {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      await Order.findOneAndUpdate(
        {
          razorpayOrderId: razorpay_order_id,
        },
        {
          status: "failed",
        },
      );

      throw new Error("Failed to make payment");
    }

    const order = await Order.findOneAndUpdate(
      {
        razorpayOrderId: razorpay_order_id,
      },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
      },
      {
        returnDocument: "after",
      },
    );

    return { order };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to make payment");
  }
};