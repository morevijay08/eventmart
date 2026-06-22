const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  orderId:  { type: String, required: true },
  userId:   { type: String, required: true },
  amount:   { type: Number, required: true }, // in paise (₹1 = 100 paise)

  // Stripe fields
  stripePaymentIntentId: { type: String },
  stripeClientSecret:    { type: String },

  status: {
    type: String,
    enum: ['created', 'processing', 'success', 'failed', 'refunded'],
    default: 'created'
  },

  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'cod', 'wallet'],
    default: 'card'
  },

  failureReason: { type: String },

  // Full Stripe response saved for audit
  stripeResponse: { type: Object }

}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);