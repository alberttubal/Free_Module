// routes/survival.js
const express = require("express");
const pool = require("../db");
const { actionLimiter } = require("../middleware/rateLimiters");
const { body, param, validationResult } = require("express-validator");

const router = express.Router();

// ==================== GET ALL SURVIVAL GUIDES ====================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM survival_guides ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch survival guides error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== GET SURVIVAL GUIDE BY ID ====================
router.get(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { id } = req.params;
      const result = await pool.query("SELECT * FROM survival_guides WHERE id = $1", [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: "Guide not found" });
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Fetch survival guide error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ==================== CREATE SURVIVAL GUIDE ====================
router.post(
  "/",
  actionLimiter,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("content").trim().notEmpty().withMessage("Content is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, content } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO survival_guides (title, content) VALUES ($1, $2) RETURNING *",
        [title, content]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Create survival guide error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ==================== UPDATE SURVIVAL GUIDE ====================
router.put(
  "/:id",
  actionLimiter,
  [
    param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("content").optional().trim().notEmpty().withMessage("Content cannot be empty"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { title, content } = req.body;

    if (!title && !content) {
      return res.status(400).json({ error: "At least one field must be provided to update" });
    }

    try {
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (title) {
        updates.push(`title = $${paramIndex++}`);
        values.push(title);
      }
      if (content) {
        updates.push(`content = $${paramIndex++}`);
        values.push(content);
      }

      values.push(id);

      const result = await pool.query(
        `UPDATE survival_guides SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      if (result.rows.length === 0) return res.status(404).json({ error: "Guide not found" });
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Update survival guide error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ==================== DELETE SURVIVAL GUIDE ====================
router.delete(
  "/:id",
  actionLimiter,
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { id } = req.params;
      const result = await pool.query("DELETE FROM survival_guides WHERE id = $1 RETURNING *", [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: "Guide not found" });
      res.json({ message: "Guide deleted successfully", deleted: result.rows[0] });
    } catch (err) {
      console.error("Delete survival guide error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
