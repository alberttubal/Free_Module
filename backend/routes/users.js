const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { body, param, validationResult } = require("express-validator");
const { actionLimiter } = require("../middleware/rateLimiters");
const xss = require("xss");

const router = express.Router();

function sendValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: { code: "VALIDATION", details: errors.array() } });
    return true;
  }
  return false;
}

// ==================== GET CURRENT USER PROFILE ====================
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
    }

    const r = rows[0];
    res.json({
      id: r.id,
      name: xss(r.name),
      email: xss(r.email),
      created_at: r.created_at
    });
  } catch (err) {
    console.error("Fetch user profile error:", err);
    res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
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
    if (sendValidation(req, res)) return;

    const { name, email } = req.body;
    if (!name && !email) {
      return res.status(400).json({
        error: { code: "NO_FIELDS", message: "At least one field (name or email) is required to update" }
      });
    }

    try {
      const updates = [];
      const values = [];
      let i = 1;

      if (name) {
        updates.push(`name = $${i++}`);
        values.push(name.trim());
      }
      if (email) {
        updates.push(`email = $${i++}`);
        values.push(email.trim().toLowerCase());
      }

      values.push(req.user.id);

      const { rows } = await pool.query(
        `UPDATE users
         SET ${updates.join(", ")}
         WHERE id = $${i}
         RETURNING id, name, email, created_at`,
        values
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
      }

      const r = rows[0];
      res.json({
        id: r.id,
        name: xss(r.name),
        email: xss(r.email),
        created_at: r.created_at
      });
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({ error: { code: "UNIQUE_CONSTRAINT", message: "Email already exists" } });
      }
      console.error("Update user profile error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== DELETE CURRENT USER ACCOUNT ====================
router.delete("/me", authMiddleware, actionLimiter, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `DELETE FROM users
       WHERE id = $1
       RETURNING id, name, email, created_at`,
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
    }

    const r = rows[0];
    res.json({
      message: "User account deleted successfully",
      deleted: {
        id: r.id,
        name: xss(r.name),
        email: xss(r.email),
        created_at: r.created_at
      }
    });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
  }
});

module.exports = router;
