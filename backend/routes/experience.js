// routes/experience.js
const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { actionLimiter } = require("../middleware/rateLimiters");
const { body, param, validationResult } = require("express-validator");
const xss = require("xss");

const router = express.Router();

// Helper to standardize validation errors
const sendValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: { code: "VALIDATION", details: errors.array() } });
    return true;
  }
  return false;
};

// ==================== GET ALL EXPERIENCE POSTS ====================
router.get("/", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const offset = parseInt(req.query.offset, 10) || 0;

  try {
    const { rows } = await pool.query(
      `SELECT e.id, e.user_id, e.title, e.content, e.image_url, e.created_at, u.name AS author_name
       FROM experience_posts e
       JOIN users u ON e.user_id = u.id
       ORDER BY e.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const items = rows.map(r => ({
      id: r.id,
      user_id: r.user_id,
      title: xss(r.title || ""),
      content: xss(r.content || ""),
      image_url: xss(r.image_url || ""),
      author_name: xss(r.author_name || ""),
      created_at: r.created_at
    }));

    res.json({ items, limit, offset });
  } catch (err) {
    console.error("Fetch experience posts error:", err);
    res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
  }
});

// ==================== GET EXPERIENCE POST BY ID ====================
router.get(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  async (req, res) => {
    if (sendValidation(req, res)) return;

    try {
      const { id } = req.params;
      const { rows } = await pool.query(
        `SELECT e.id, e.user_id, e.title, e.content, e.image_url, e.created_at, u.name AS author_name
         FROM experience_posts e
         JOIN users u ON e.user_id = u.id
         WHERE e.id = $1`,
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Post not found" } });
      }
      const r = rows[0];
      return res.json({
        id: r.id,
        user_id: r.user_id,
        title: xss(r.title || ""),
        content: xss(r.content || ""),
        image_url: xss(r.image_url || ""),
        author_name: xss(r.author_name || ""),
        created_at: r.created_at
      });
    } catch (err) {
      console.error("Fetch experience post error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
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
    if (sendValidation(req, res)) return;

    // Optionally sanitize inputs before storage
    const title = req.body.title ? req.body.title.trim() : null;
    const content = req.body.content.trim();
    const image_url = req.body.image_url ? req.body.image_url.trim() : null;

    try {
      const { rows } = await pool.query(
        `INSERT INTO experience_posts (user_id, title, content, image_url)
         VALUES ($1, $2, $3, $4)
         RETURNING id, user_id, title, content, image_url, created_at`,
        [req.user.id, title, content, image_url]
      );

      const r = rows[0];
      res.status(201).json({
        id: r.id,
        user_id: r.user_id,
        title: xss(r.title || ""),
        content: xss(r.content || ""),
        image_url: xss(r.image_url || ""),
        created_at: r.created_at
      });
    } catch (err) {
      console.error("Create experience post error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
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
    if (sendValidation(req, res)) return;

    const { id } = req.params;
    const { title, content, image_url } = req.body;

    if (!title && !content && !image_url) {
      return res.status(400).json({
        error: { code: "NO_FIELDS", message: "At least one field must be provided to update" }
      });
    }

    try {
      const updates = [];
      const values = [];
      let i = 1;

      if (title) {
        updates.push(`title = $${i++}`);
        values.push(title.trim());
      }
      if (content) {
        updates.push(`content = $${i++}`);
        values.push(content.trim());
      }
      if (image_url) {
        updates.push(`image_url = $${i++}`);
        values.push(image_url.trim());
      }

      values.push(id);
      values.push(req.user.id);

      const { rows } = await pool.query(
        `UPDATE experience_posts
         SET ${updates.join(", ")}
         WHERE id = $${i++} AND user_id = $${i}
         RETURNING id, user_id, title, content, image_url, created_at`,
        values
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Post not found or not owned by user" } });
      }

      const r = rows[0];
      res.json({
        id: r.id,
        user_id: r.user_id,
        title: xss(r.title || ""),
        content: xss(r.content || ""),
        image_url: xss(r.image_url || ""),
        created_at: r.created_at
      });
    } catch (err) {
      console.error("Update experience post error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
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
    if (sendValidation(req, res)) return;

    try {
      const { id } = req.params;
      const { rows } = await pool.query(
        `DELETE FROM experience_posts
         WHERE id = $1 AND user_id = $2
         RETURNING id, user_id, title, content, image_url, created_at`,
        [id, req.user.id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Post not found or not owned by user" } });
      }
      const r = rows[0];
      res.json({
        message: "Post deleted successfully",
        deleted: {
          id: r.id,
          user_id: r.user_id,
          title: xss(r.title || ""),
          content: xss(r.content || ""),
          image_url: xss(r.image_url || ""),
          created_at: r.created_at
        }
      });
    } catch (err) {
      console.error("Delete experience post error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

module.exports = router;
