const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userId:    { type: String, required: true },
  userName:  { type: String, required: true },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  comment:   { type: String },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({

  // Basic info
  name:        { type: String, required: true },
  brand:       { type: String, required: true },
  description: { type: String, required: true },
  category:    {
    type: String,
    required: true,
    enum: ['mobiles', 'laptops', 'audio', 'cameras', 'accessories', 'tablets', 'televisions']
  },

  // Pricing
  price:         { type: Number, required: true },
  originalPrice: { type: Number },          // for showing "was ₹X" strikethrough
  discount:      { type: Number, default: 0 }, // percentage

  // Media
  images: [{ type: String }],              // array of image URLs
  thumbnail: { type: String },             // main listing image

  // Stock
  stock:       { type: Number, required: true, default: 0 },
  isAvailable: { type: Boolean, default: true },

  // Specs — flexible object, different per category
  specs: { type: Map, of: String },
  // Example for phone:    { display: "6.7 inch", ram: "8GB", storage: "128GB", battery: "5000mAh" }
  // Example for laptop:   { processor: "i5 12th Gen", ram: "16GB", storage: "512GB SSD" }
  // Example for headphone:{ type: "Over-ear", connectivity: "Bluetooth 5.3", battery: "30hrs" }

  // Variants (e.g. 128GB / 256GB)
  variants: [{
    name:  { type: String },   // "128GB Black"
    price: { type: Number },
    stock: { type: Number }
  }],

  // Tags for search boosting
  tags: [{ type: String }],

  // Ratings
  reviews:       [reviewSchema],
  averageRating: { type: Number, default: 0 },
  totalReviews:  { type: Number, default: 0 },

  // Metadata
  isFeatured:    { type: Boolean, default: false },
  isNewArrival:  { type: Boolean, default: false },

}, { timestamps: true });

// Full-text search index
productSchema.index({ name: 'text', brand: 'text', description: 'text', tags: 'text' });

module.exports = mongoose.model('Product', productSchema);