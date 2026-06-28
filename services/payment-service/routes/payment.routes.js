const express      = require('express');
const router       = express.Router();
const Payment      = require('../models/Payment');
const verifyToken  = require('../middleware/verifyToken');
const stripe       = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ─── GET PAYMENT BY ORDER ID ──────────────────────────────────────────────────
router.get('/order/:orderId', verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      orderId: req.params.orderId,
      userId:  req.user.id
    });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ payment });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET MY PAYMENT HISTORY ───────────────────────────────────────────────────
router.get('/my-payments', verifyToken, async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .select('-stripeResponse'); // don't expose full stripe object
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET STRIPE CLIENT SECRET (for frontend Stripe Elements) ─────────────────
// Frontend calls this to get the secret needed to render the payment form
router.get('/client-secret/:orderId', verifyToken, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      orderId: req.params.orderId,
      userId:  req.user.id
    });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    res.json({ clientSecret: payment.stripeClientSecret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ALL PAYMENTS (admin) ─────────────────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .select('-stripeResponse');
    res.json({ payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;