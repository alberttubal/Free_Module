const rateLimit = require("express-rate-limit");


// Global rate limiter for spammy actions (comments, likes, etc.)
const actionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,   // 5 minutes
  max: 30,                   // 30 actions per 5 min per IP
  message: { error: "Too many actions, please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit login attempts: 5 per minute per IP
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit signup attempts: 10 per 15 minutes per IP
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many signup attempts. Please wait before retrying." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { actionLimiter, loginLimiter, signupLimiter };




//how to import
//in auth.js const { loginLimiter, signupLimiter } = require("../middleware/rateLimiters");
//in comments.js  const { actionLimiter } = require("../middleware/rateLimiters");


