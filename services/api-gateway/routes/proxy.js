const { createProxyMiddleware } = require('http-proxy-middleware');
const verifyToken = require('../middleware/verifyToken');
const { authLimiter } = require('../middleware/rateLimiter');

const setupRoutes = (app) => {

  // ── AUTH SERVICE (public — no token needed) ───────────────────────────────
  app.use('/api/auth', authLimiter, createProxyMiddleware({
    target:      process.env.AUTH_SERVICE_URL,
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        res.status(503).json({ message: 'Auth service unavailable' });
      }
    }
  }));

  // ── PRODUCT SERVICE (public GET, protected POST/PUT/DELETE) ───────────────
  app.use('/api/products', (req, res, next) => {
    // Public: anyone can browse products
    if (req.method === 'GET') return next();
    // Protected: only admin can create/update/delete
    verifyToken(req, res, next);
  }, createProxyMiddleware({
    target:      process.env.PRODUCT_SERVICE_URL,
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        res.status(503).json({ message: 'Product service unavailable' });
      }
    }
  }));

  // ── CART SERVICE (protected — must be logged in) ──────────────────────────
  app.use('/api/cart', verifyToken, createProxyMiddleware({
    target:      process.env.CART_SERVICE_URL,
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        res.status(503).json({ message: 'Cart service unavailable' });
      }
    }
  }));

  // ── ORDER SERVICE (protected) ─────────────────────────────────────────────
  app.use('/api/orders', verifyToken, createProxyMiddleware({
    target:      process.env.ORDER_SERVICE_URL,
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        res.status(503).json({ message: 'Order service unavailable' });
      }
    }
  }));

  // ── PAYMENT SERVICE (protected) ───────────────────────────────────────────
  app.use('/api/payments', verifyToken, createProxyMiddleware({
    target:      process.env.PAYMENT_SERVICE_URL,
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        res.status(503).json({ message: 'Payment service unavailable' });
      }
    }
  }));

};

module.exports = setupRoutes;