const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { verifyToken, verifyAdmin } = require('../middleware/verifyToken');

// ─── GET ALL PRODUCTS with filter + sort + pagination ───────────────────────
router.get('/', async (req, res) => {
  try {
    const {
      category, brand, minPrice, maxPrice,
      sort, page = 1, limit = 12,
      featured, newArrival
    } = req.query;

    const filter = {}; 

    if (category)              filter.category = category;
    if (brand)                 filter.brand = new RegExp(brand, 'i');
    if (featured === 'true')   filter.isFeatured = true;
    if (newArrival === 'true') filter.isNewArrival = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortOptions = {
      'price_asc':  { price: 1 },
      'price_desc': { price: -1 },
      'rating':     { averageRating: -1 },
      'newest':     { createdAt: -1 }
    };
    const sortBy = sortOptions[sort] || { createdAt: -1 };

    const skip = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .sort(sortBy)
      .skip(skip)
      .limit(Number(limit))
      .select('-reviews');  // don't send reviews in listing, only in detail

    res.json({
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── SEARCH ─────────────────────────────────────────────────────────────────
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query required' });

    const products = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    )
    .sort({ score: { $meta: 'textScore' } })
    .limit(20)
    .select('-reviews');

    res.json({ products, total: products.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET FEATURED ────────────────────────────────────────────────────────────
router.get('/featured', async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true })
      .limit(8).select('-reviews');
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET NEW ARRIVALS ────────────────────────────────────────────────────────
router.get('/new-arrivals', async (req, res) => {
  try {
    const products = await Product.find({ isNewArrival: true })
      .sort({ createdAt: -1 }).limit(8).select('-reviews');
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET SINGLE PRODUCT ──────────────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── CREATE PRODUCT (admin only) ─────────────────────────────────────────────
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── UPDATE PRODUCT (admin only) ─────────────────────────────────────────────
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id, req.body, { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── UPDATE STOCK (called internally by Order Service via event) ──────────────
router.patch('/:id/stock', async (req, res) => {
  try {
    const { quantity, operation } = req.body;
    // operation: 'decrement' when order placed, 'increment' when order cancelled
    const update = operation === 'decrement'
      ? { $inc: { stock: -quantity } }
      : { $inc: { stock: quantity } };

    const product = await Product.findByIdAndUpdate(
      req.params.id, update, { new: true }
    );
    if (product.stock <= 0) {
      await Product.findByIdAndUpdate(req.params.id, { isAvailable: false });
    }
    res.json({ stock: product.stock });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ADD REVIEW (logged in users) ────────────────────────────────────────────
router.post('/:id/reviews', verifyToken, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const review = {
      userId:   req.user.id,
      userName: req.user.email,
      rating,
      comment
    };

    product.reviews.push(review);
    product.totalReviews = product.reviews.length;
    product.averageRating = (
      product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
    ).toFixed(1);

    await product.save();
    res.status(201).json({ message: 'Review added', averageRating: product.averageRating });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── DELETE PRODUCT (admin only) ─────────────────────────────────────────────
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;