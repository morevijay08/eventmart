const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId:  { type: String, required: true },
  name:       { type: String, required: true },
  brand:      { type: String, required: true },
  thumbnail:  { type: String },
  price:      { type: Number, required: true },  // price snapshot at time of adding
  quantity:   { type: Number, required: true, default: 1, min: 1 },
  stock:      { type: Number },                  // available stock at time of adding
  category:   { type: String }
});

const cartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items:  [cartItemSchema],

  // Calculated totals — updated every time cart changes
  totalItems:    { type: Number, default: 0 },
  totalPrice:    { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },

}, { timestamps: true });

// Auto-calculate totals before saving
cartSchema.pre('save', function (next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  this.totalPrice = this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  next();
});

module.exports = mongoose.model('Cart', cartSchema);