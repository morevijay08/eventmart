const express = require('express');
const router  = express.Router();
const axios   = require('axios');
const Cart    = require('../models/Cart');
const verifyToken = require('../middleware/verifyToken');
// Helper — fetch product from Product Service
const getProduct = async (productId) => {
  const res = await axios.get(`${process.env.PRODUCT_SERVICE_URL}/api/products/${productId}`);
  return res.data.product;
};

// ─── GET CART ────────────────────────────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      // Return empty cart instead of 404
      return res.json({
        cart: { userId: req.user.id, items: [], totalItems: 0, totalPrice: 0 }
      });
    }
    res.json({ cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── ADD TO CART ──────────────────────────────────────────────────────────────
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    if (!productId) return res.status(400).json({ message: 'productId is required' });

    // Fetch latest product data from Product Service
    let product;
    try {
      product = await getProduct(productId);
    } catch (err) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({ message: `Only ${product.stock} items in stock` });
    }

    let cart = await Cart.findOne({ userId: req.user.id });

    if (!cart) {
      // Create new cart for this user
      cart = new Cart({ userId: req.user.id, items: [] });
    }

    // Check if product already in cart
    const existingIndex = cart.items.findIndex(
      item => item.productId === productId
    );

    if (existingIndex > -1) {
      // Update quantity
      const newQty = cart.items[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        return res.status(400).json({ message: `Cannot add more. Only ${product.stock} in stock` });
      }
      cart.items[existingIndex].quantity = newQty;
    } else {
      // Add new item
      cart.items.push({
        productId,
        name:      product.name,
        brand:     product.brand,
        thumbnail: product.thumbnail,
        price:     product.price,
        stock:     product.stock,
        quantity,
        category:  product.category
      });
    }

    await cart.save();
    res.status(200).json({ message: 'Item added to cart', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── UPDATE QUANTITY ──────────────────────────────────────────────────────────
router.patch('/update', verifyToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      return res.status(400).json({ message: 'productId and quantity required' });
    }
    if (quantity < 1) {
      return res.status(400).json({ message: 'Quantity must be at least 1' });
    }

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(i => i.productId === productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    // Validate against current stock
    const product = await getProduct(productId);
    if (quantity > product.stock) {
      return res.status(400).json({ message: `Only ${product.stock} items available` });
    }

    item.quantity = quantity;
    await cart.save();
    res.json({ message: 'Cart updated', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── REMOVE ITEM ──────────────────────────────────────────────────────────────
router.delete('/remove/:productId', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(
      item => item.productId !== req.params.productId
    );

    await cart.save();
    res.json({ message: 'Item removed', cart });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── CLEAR CART ───────────────────────────────────────────────────────────────
// Called internally after order is placed successfully
router.delete('/clear', verifyToken, async (req, res) => {
  try {
    await Cart.findOneAndUpdate(
      { userId: req.user.id },
      { items: [], totalItems: 0, totalPrice: 0 },
      { new: true }
    );
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET CART SUMMARY ─────────────────────────────────────────────────────────
// Used by checkout page to show final price breakdown
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    const deliveryCharge = cart.totalPrice > 50000 ? 0 : 99;
    const tax = +(cart.totalPrice * 0.18).toFixed(2); // 18% GST

    res.json({
      summary: {
        items:          cart.items,
        totalItems:     cart.totalItems,
        subTotal:       cart.totalPrice,
        deliveryCharge,
        tax,
        grandTotal:     +(cart.totalPrice + deliveryCharge + tax).toFixed(2),
        freeDelivery:   cart.totalPrice > 50000
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;  