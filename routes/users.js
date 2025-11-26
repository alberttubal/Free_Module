// routes/users.js
const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { body, param, validationResult } = require("express-validator");
const { actionLimiter } = require("../middleware/rateLimiters");

const router = express.Router();

// ==================== GET CURRENT USER PROFILE ====================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Fetch user profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== UPDATE CURRENT USER PROFILE ====================
router.put(
  "/me",
  authMiddleware,
  actionLimiter,
  [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("email").optional().isEmail().withMessage("Email must be valid"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email } = req.body;
    if (!name && !email) {
      return res.status(400).json({ error: "At least one field (name or email) is required to update" });
    }

    try {
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (name) {
        updates.push(`name = $${paramIndex++}`);
        values.push(name);
      }
      if (email) {
        updates.push(`email = $${paramIndex++}`);
        values.push(email);
      }

      values.push(req.user.id);

      const result = await pool.query(
        `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING id, name, email, created_at`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({ error: "Email already exists" });
      }
      console.error("Update user profile error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ==================== DELETE CURRENT USER ACCOUNT ====================
router.delete("/me", authMiddleware, actionLimiter, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM users WHERE id = $1 RETURNING *", [req.user.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User account deleted successfully", deleted: result.rows[0] });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
