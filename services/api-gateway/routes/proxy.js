const { createProxyMiddleware } = require('http-proxy-middleware');
const verifyToken = require('../middleware/verifyToken');
const { authLimiter } = require('../middleware/rateLimiter');

const setupRoutes = (app) => {

  // ── AUTH SERVICE (public) ────────────────────────────────────────────────
  app.use(
    '/api/auth',
    authLimiter,
    createProxyMiddleware({
      target: `${process.env.AUTH_SERVICE_URL}/api/auth`,
      changeOrigin: true,

      on: {
        error: (err, req, res) => {
          res.status(503).json({
            message: 'Auth service unavailable'
          });
        }
      }
    })
  );

  // ── PRODUCT SERVICE ─────────────────────────────────────────────────────
  app.use(
    '/api/products',
    (req, res, next) => {
      if (req.method === 'GET') return next();

      verifyToken(req, res, next);
    },
    createProxyMiddleware({
      target: `${process.env.PRODUCT_SERVICE_URL}/api/products`,
      changeOrigin: true,

      on: {
        error: (err, req, res) => {
          res.status(503).json({
            message: 'Product service unavailable'
          });
        }
      }
    })
  );

  // ── CART SERVICE ────────────────────────────────────────────────────────
  app.use(
    '/api/cart',
    verifyToken,
    createProxyMiddleware({
      target: `${process.env.CART_SERVICE_URL}/api/cart`,
      changeOrigin: true,

      on: {
        error: (err, req, res) => {
          res.status(503).json({
            message: 'Cart service unavailable'
          });
        }
      }
    })
  );

  // ── ORDER SERVICE ───────────────────────────────────────────────────────
  app.use(
    '/api/orders',
    verifyToken,
    createProxyMiddleware({
      target: `${process.env.ORDER_SERVICE_URL}/api/orders`,
      changeOrigin: true,

      on: {
        error: (err, req, res) => {
          res.status(503).json({
            message: 'Order service unavailable'
          });
        }
      }
    })
  );

  // ── PAYMENT SERVICE ─────────────────────────────────────────────────────
  app.use(
    '/api/payments',
    verifyToken,
    createProxyMiddleware({
      target: `${process.env.PAYMENT_SERVICE_URL}/api/payments`,
      changeOrigin: true,

      on: {
        error: (err, req, res) => {
          res.status(503).json({
            message: 'Payment service unavailable'
          });
        }
      }
    })
  );

};

module.exports = setupRoutes;