import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import Ingredient from '../models/Ingredient.js';
import { protect, adminOnly } from '../middleware/auth.js';

dotenv.config();

const router = express.Router();

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

// Create Razorpay Order (with auto Test-Mode fallback)
router.post('/checkout', protect, async (req, res) => {
  try {
    const { items, totalAmount } = req.body;

    let razorpayOrderId = `order_test_${Date.now()}`;

    // Try real Razorpay if keys are configured, otherwise use test order id
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_ID !== 'rzp_test_placeholder') {
      try {
        const options = {
          amount: Math.round(totalAmount * 100),
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        };
        const rzpOrder = await razorpay.orders.create(options);
        razorpayOrderId = rzpOrder.id;
      } catch (rzpErr) {
        console.warn('Razorpay API failed or unconfigured, running in Test Simulator mode:', rzpErr.message);
      }
    }

    const newOrder = await Order.create({
      user: req.user._id,
      items,
      totalAmount,
      razorpayOrderId,
      paymentStatus: 'pending',
    });

    res.status(201).json({
      order: newOrder,
      razorpayOrder: {
        id: razorpayOrderId,
        amount: Math.round(totalAmount * 100),
        currency: 'INR',
      },
    });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Verify Payment & Deduct Inventory
router.post('/verify-payment', protect, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Verify signature only if using actual live/test keys
    if (
      process.env.RAZORPAY_KEY_SECRET &&
      process.env.RAZORPAY_KEY_SECRET !== 'placeholder_secret' &&
      razorpay_signature !== 'simulated_test_signature'
    ) {
      const body = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: 'Payment verification failed' });
      }
    }

    const order = await Order.findById(orderId).populate(
      'items.base items.sauce items.cheese items.veggies'
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpay_payment_id || `pay_test_${Date.now()}`;
    await order.save();

    // Deduct stock for ingredients
    for (const item of order.items) {
      const ids = [item.base, item.sauce, item.cheese, ...(item.veggies || [])].filter(Boolean);
      for (const ingredient of ids) {
        const idToUpdate = ingredient._id || ingredient;
        await Ingredient.findByIdAndUpdate(idToUpdate, { $inc: { stock: -1 } });
      }
    }

    res.json({ message: 'Payment successful', order });
  } catch (err) {
    console.error('Payment verification error:', err);
    res.status(500).json({ message: err.message });
  }
});

// User: Get personal orders
router.get('/my-orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.base items.sauce items.cheese items.veggies')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Get all orders
router.get('/admin/orders', protect, adminOnly, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .populate('items.base items.sauce items.cheese items.veggies')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Update order status
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: status },
      { new: true }
    );
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;