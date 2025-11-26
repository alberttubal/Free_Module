const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const pool = require("../db");
const { loginLimiter, signupLimiter } = require("../middleware/rateLimiters");
const { signupValidators, loginValidators } = require("../middleware/validators");
const sanitize = require("../utils/sanitize"); // ✅ import sanitize

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

// ==================== SIGNUP ====================
router.post(
  "/signup",
  signupLimiter,
  signupValidators,
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email")
      .trim()
      .isEmail().withMessage("Valid email required")
      .custom((value) => {
        if (!value.endsWith("@ustp.edu.ph")) throw new Error("Must use USTP email");
        return true;
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
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
      console.error("Signup error:", err);
      if (err.code === "23505") return res.status(409).json({ error: "Email already in use" });
      res.status(500).json({ error: "Signup failed" });
    }
  }
);

// ==================== LOGIN ====================
router.post(
  "/login",
  loginLimiter,
  loginValidators,
  [
    body("email").trim().isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").trim().notEmpty().withMessage("Password required"),
  ],
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

module.exports = router; // ✅ export the router, not validators
