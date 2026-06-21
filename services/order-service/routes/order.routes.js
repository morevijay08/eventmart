const express      = require('express');
const router       = express.Router();
const axios        = require('axios');
const Order        = require('../models/Order');
const verifyToken  = require('../middleware/verifyToken');
const { publishEvent } = require('../events/publisher');

// Helper — calculate estimated delivery (5 days from now)
const getEstimatedDelivery = () => {
  const date = new Date();
  date.setDate(date.getDate() + 5);
  return date;
};

// ─── PLACE ORDER ─────────────────────────────────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    if (!shippingAddress) {
      return res.status(400).json({ message: 'Shipping address is required' });
    }

    // 1. Fetch cart summary from Cart Service
    let cartSummary;
    try {
      const cartRes = await axios.get(
        `${process.env.CART_SERVICE_URL}/api/cart/summary`,
        { headers: { authorization: req.headers.authorization } }
      );
      cartSummary = cartRes.data.summary;
    } catch (err) {
      return res.status(400).json({ message: 'Cart is empty or unavailable' });
    }

    if (!cartSummary.items || cartSummary.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // 2. Create the order
    const order = await Order.create({
      userId: req.user.id,
      items:  cartSummary.items.map(item => ({
        productId: item.productId,
        name:      item.name,
        brand:     item.brand,
        thumbnail: item.thumbnail,
        price:     item.price,
        quantity:  item.quantity
      })),
      subTotal:          cartSummary.subTotal,
      deliveryCharge:    cartSummary.deliveryCharge,
      tax:               cartSummary.tax,
      grandTotal:        cartSummary.grandTotal,
      shippingAddress,
      paymentMethod:     paymentMethod || 'card',
      status:            'placed',
      estimatedDelivery: getEstimatedDelivery(),
      statusHistory: [{
        status:  'placed',
        message: 'Order placed successfully'
      }]
    });

    // 3. Publish event → Payment Service will pick this up
    await publishEvent('order.created', {
      orderId:    order._id,
      userId:     req.user.id,
      grandTotal: order.grandTotal,
      items:      order.items,
      paymentMethod
    });

    // 4. Clear the cart after order placed
    try {
      await axios.delete(
        `${process.env.CART_SERVICE_URL}/api/cart/clear`,
        { headers: { authorization: req.headers.authorization } }
      );
    } catch (err) {
      console.log('Cart clear failed (non-critical):', err.message);
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        orderId:           order._id,
        status:            order.status,
        grandTotal:        order.grandTotal,
        estimatedDelivery: order.estimatedDelivery
      }
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET MY ORDERS ────────────────────────────────────────────────────────────
router.get('/my-orders', verifyToken, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET SINGLE ORDER ─────────────────────────────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id:    req.params.id,
      userId: req.user.id   // users can only see their own orders
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── CANCEL ORDER ─────────────────────────────────────────────────────────────
router.patch('/:id/cancel', verifyToken, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id:    req.params.id,
      userId: req.user.id
    });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // Can only cancel if not yet shipped
    if (['shipped', 'delivered'].includes(order.status)) {
      return res.status(400).json({ message: `Cannot cancel order in '${order.status}' status` });
    }

    order.status = 'cancelled';
    order.statusHistory.push({
      status:  'cancelled',
      message: 'Order cancelled by customer'
    });
    await order.save();

    // Notify other services
    await publishEvent('order.cancelled', {
      orderId: order._id,
      userId:  order.userId,
      items:   order.items
    });

    res.json({ message: 'Order cancelled successfully', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GET ALL ORDERS (admin) ───────────────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Order.countDocuments(filter);
    res.json({ orders, total });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;