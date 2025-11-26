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
  "/register",              // ✅ use /register instead of /signup
  signupLimiter,
  signupValidators,         // ✅ only this, no manual body() rules
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  async (req, res) => {
    let { name, email, password } = req.body;
    name = sanitize(name);

    try {
      const hash = await bcrypt.hash(password, 10);
      const { rows } = await pool.query(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
        [name, email, hash]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error("Register error:", err);
      if (err.code === "23505") return res.status(409).json({ error: "Email already in use" });
      res.status(500).json({ error: "Registration failed" });
    }
  }
);

// ==================== LOGIN ====================
router.post(
  "/login",
  loginLimiter,
  loginValidators,          // ✅ keep validators centralized
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  async (req, res) => {
    const { email, password } = req.body;

    try {
      const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (rows.length === 0) return res.status(400).json({ error: "Invalid credentials" });

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(400).json({ error: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1h" });
      res.json({ token });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  }
);

module.exports = router; // ✅ export router only
