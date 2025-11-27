const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const pool = require("../db");
const { loginLimiter, signupLimiter } = require("../middleware/rateLimiters");
const { signupValidators, loginValidators } = require("../middleware/validators");
const sanitize = require("../utils/sanitize"); // ✅ import sanitize

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

// ==================== REGISTER ====================
router.post(
  "/register",
  signupLimiter,
  signupValidators,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: { code: "VALIDATION", details: errors.array() } });
    next();
  },
  async (req, res) => {
    let { name, email, password } = req.body;
    name = sanitize(String(name || "").trim());
    email = String(email || "").trim().toLowerCase();

    try {
      const hash = await bcrypt.hash(password, 12); // stronger cost if acceptable
      const { rows } = await pool.query(
        `INSERT INTO users (name, email, password_hash)
         VALUES ($1, $2, $3)
         RETURNING id, name, email, created_at`,
        [name, email, hash]
      );
      // Optionally sanitize echoed fields (defense-in-depth)
      const user = rows[0];
      res.status(201).json({
        id: user.id,
        name: sanitize(user.name),
        email: sanitize(user.email),
        created_at: user.created_at
      });
    } catch (err) {
      console.error("Register error:", err);
      if (err.code === "23505") {
        return res.status(409).json({ error: { code: "EMAIL_CONFLICT", message: "Email already in use" } });
      }
      return res.status(500).json({ error: { code: "REGISTER_FAILED", message: "Registration failed" } });
    }
  }
);


// ==================== LOGIN ====================
router.post(
  "/login",
  loginLimiter,
  loginValidators,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ error: { code: "VALIDATION", details: errors.array() } });
    next();
  },
  async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    const password = String(req.body.password || "");

    try {
      const { rows } = await pool.query(
        "SELECT id, email, password_hash, name FROM users WHERE email = $1",
        [email]
      );
      if (rows.length === 0) return res.status(400).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" } });

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(400).json({ error: { code: "INVALID_CREDENTIALS", message: "Invalid credentials" } });

      const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1h" });
      return res.json({
        token,
        user: { id: user.id, name: sanitize(user.name), email: sanitize(user.email) } // optional
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ error: { code: "LOGIN_FAILED", message: "Login failed" } });
    }
  }
);


module.exports = router; // ✅ export router only
