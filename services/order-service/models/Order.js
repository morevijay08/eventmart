const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name:      { type: String, required: true },
  brand:     { type: String, required: true },
  thumbnail: { type: String },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true }
});

const statusHistorySchema = new mongoose.Schema({
  status:    { type: String },
  message:   { type: String },
  timestamp: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  userId:   { type: String, required: true },
  items:    [orderItemSchema],

  // Price breakdown
  subTotal:       { type: Number, required: true },
  deliveryCharge: { type: Number, default: 0 },
  tax:            { type: Number, default: 0 },
  grandTotal:     { type: Number, required: true },

  // Shipping address
  shippingAddress: {
    fullName: { type: String, required: true },
    phone:    { type: String, required: true },
    street:   { type: String, required: true },
    city:     { type: String, required: true },
    state:    { type: String, required: true },
    pincode:  { type: String, required: true }
  },

  // Payment
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'cod', 'wallet'],
    default: 'card'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  stripePaymentId: { type: String },

  // Order status — this changes as events fire
  status: {
    type: String,
    enum: [
      'placed',           // order created
      'payment_pending',  // waiting for payment
      'confirmed',        // payment success + stock reserved
      'processing',       // warehouse preparing
      'shipped',          // out for delivery
      'delivered',        // delivered to customer
      'cancelled',        // cancelled at any stage
      'payment_failed'    // payment failed
    ],
    default: 'placed'
  },

  // Full history of status changes — shows on order tracking page
  statusHistory: [statusHistorySchema],

  estimatedDelivery: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);