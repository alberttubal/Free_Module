// routes/experience.js
const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { actionLimiter } = require("../middleware/rateLimiters");
const { body, param, validationResult } = require("express-validator");

const router = express.Router();

// ==================== GET ALL EXPERIENCE POSTS ====================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT e.*, u.name AS author_name 
       FROM experience_posts e 
       JOIN users u ON e.user_id = u.id 
       ORDER BY e.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch experience posts error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== GET EXPERIENCE POST BY ID ====================
router.get(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT e.*, u.name AS author_name 
         FROM experience_posts e 
         JOIN users u ON e.user_id = u.id 
         WHERE e.id = $1`,
        [id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: "Post not found" });
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Fetch experience post error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ==================== CREATE EXPERIENCE POST ====================
router.post(
  "/",
  authMiddleware,
  actionLimiter,
  [
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("content").trim().notEmpty().withMessage("Content is required"),
    body("image_url").optional().isURL().withMessage("image_url must be a valid URL"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, content, image_url } = req.body;
    try {
      const result = await pool.query(
        `INSERT INTO experience_posts (user_id, title, content, image_url) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [req.user.id, title || null, content, image_url || null]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Create experience post error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ==================== UPDATE EXPERIENCE POST ====================
router.put(
  "/:id",
  authMiddleware,
  actionLimiter,
  [
    param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("content").optional().trim().notEmpty().withMessage("Content cannot be empty"),
    body("image_url").optional().isURL().withMessage("image_url must be a valid URL"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { title, content, image_url } = req.body;

    if (!title && !content && !image_url) {
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
      if (image_url) {
        updates.push(`image_url = $${paramIndex++}`);
        values.push(image_url);
      }

      values.push(id);
      values.push(req.user.id); // enforce ownership

      const result = await pool.query(
        `UPDATE experience_posts 
         SET ${updates.join(", ")} 
         WHERE id = $${paramIndex++} AND user_id = $${paramIndex} 
         RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Post not found or not owned by user" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Update experience post error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ==================== DELETE EXPERIENCE POST ====================
router.delete(
  "/:id",
  authMiddleware,
  actionLimiter,
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { id } = req.params;
      const result = await pool.query(
        "DELETE FROM experience_posts WHERE id = $1 AND user_id = $2 RETURNING *",
        [id, req.user.id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Post not found or not owned by user" });
      }
      res.json({ message: "Post deleted successfully", deleted: result.rows[0] });
    } catch (err) {
      console.error("Delete experience post error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
