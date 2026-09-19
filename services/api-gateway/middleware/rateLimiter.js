const rateLimit = require('express-rate-limit');

// Global limiter — all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      100,             // 100 requests per window
  message:  { message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders:   false
});

// Strict limiter — auth routes only
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10, // only 10 login/register attempts per 15 min
  message:  { message: 'Too many auth attempts, please try again later.' }
});

module.exports = { globalLimiter, authLimiter };