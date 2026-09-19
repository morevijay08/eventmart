require('dotenv').config();
const express  = require('express');
const cors     = require('cors');
const helmet   = require('helmet');
const logger   = require('./middleware/logger');
const { globalLimiter } = require('./middleware/rateLimiter');
const setupRoutes = require('./routes/proxy');

const app = express();

// ── Security & Utility Middleware ─────────────────────────────────────────────
app.use(helmet());        // sets secure HTTP headers
app.use(cors());
app.use(logger);          // logs every request
app.use(globalLimiter);   // rate limit everything

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    service:  'api-gateway',
    status:   'running',
    services: {
      auth:         process.env.AUTH_SERVICE_URL,
      product:      process.env.PRODUCT_SERVICE_URL,
      cart:         process.env.CART_SERVICE_URL,
      order:        process.env.ORDER_SERVICE_URL,
      payment:      process.env.PAYMENT_SERVICE_URL,
    }
  });
});

// ── Setup all proxy routes ────────────────────────────────────────────────────
setupRoutes(app);

// ── Service not found ─────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});



app.listen(process.env.PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║     EventMart API Gateway            ║
  ║     Running on port ${process.env.PORT}             ║
  ╚══════════════════════════════════════╝
  `);
});