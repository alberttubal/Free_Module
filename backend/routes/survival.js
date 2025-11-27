// routes/survival.js
const express = require("express");
const pool = require("../db");
const { actionLimiter } = require("../middleware/rateLimiters");
const { body, param, query, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/auth"); // enforce ownership if guides are user-owned
const xss = require("xss");

const router = express.Router();

// ==================== Helper ====================
function sendValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: { code: "VALIDATION", details: errors.array() } });
    return true;
  }
  return false;
}

// ==================== GET ALL SURVIVAL GUIDES ====================
router.get(
  "/",
  [
    query("limit").optional().isInt({ min: 1 }).withMessage("limit must be a positive integer"),
    query("offset").optional().isInt({ min: 0 }).withMessage("offset must be a non-negative integer"),
  ],
  async (req, res) => {
    if (sendValidation(req, res)) return;

    const rawLimit = parseInt(req.query.limit, 10) || 20;
    const limit = Math.min(rawLimit, 100);
    const offset = parseInt(req.query.offset, 10) || 0;

    try {
      const { rows } = await pool.query(
        `SELECT id, title, content, user_id, created_at
         FROM survival_guides
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const items = rows.map(r => ({
        id: r.id,
        title: xss(r.title),
        content: xss(r.content),
        user_id: r.user_id,
        created_at: r.created_at,
      }));

      res.json({ items, limit, offset });
    } catch (err) {
      console.error("Fetch survival guides error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== GET SURVIVAL GUIDE BY ID ====================
router.get(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  async (req, res) => {
    if (sendValidation(req, res)) return;

    try {
      const { id } = req.params;
      const { rows } = await pool.query(
        `SELECT id, title, content, user_id, created_at
         FROM survival_guides
         WHERE id = $1`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Guide not found" } });
      }

      const r = rows[0];
      res.json({
        id: r.id,
        title: xss(r.title),
        content: xss(r.content),
        user_id: r.user_id,
        created_at: r.created_at,
      });
    } catch (err) {
      console.error("Fetch survival guide error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== CREATE SURVIVAL GUIDE ====================
router.post(
  "/",
  actionLimiter,
  authMiddleware, // enforce ownership
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("content").trim().notEmpty().withMessage("Content is required"),
  ],
  async (req, res) => {
    if (sendValidation(req, res)) return;

    const title = req.body.title.trim();
    const content = req.body.content.trim();

    try {
      const { rows } = await pool.query(
        `INSERT INTO survival_guides (title, content, user_id)
         VALUES ($1, $2, $3)
         RETURNING id, title, content, user_id, created_at`,
        [title, content, req.user.id]
      );

      const r = rows[0];
      res.status(201).json({
        id: r.id,
        title: xss(r.title),
        content: xss(r.content),
        user_id: r.user_id,
        created_at: r.created_at,
      });
    } catch (err) {
      console.error("Create survival guide error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== UPDATE SURVIVAL GUIDE ====================
router.put(
  "/:id",
  actionLimiter,
  authMiddleware, // enforce ownership
  [
    param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("content").optional().trim().notEmpty().withMessage("Content cannot be empty"),
  ],
  async (req, res) => {
    if (sendValidation(req, res)) return;

    const { id } = req.params;
    const { title, content } = req.body;

    if (!title && !content) {
      return res.status(400).json({
        error: { code: "NO_FIELDS", message: "At least one field must be provided to update" },
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

      values.push(id);
      values.push(req.user.id);

      const { rows } = await pool.query(
        `UPDATE survival_guides
         SET ${updates.join(", ")}
         WHERE id = $${i++} AND user_id = $${i}
         RETURNING id, title, content, user_id, created_at`,
        values
      );

      if (rows.length === 0) {
        return res.status(404).json({
          error: { code: "NOT_FOUND", message: "Guide not found or not owned by user" },
        });
      }

      const r = rows[0];
      res.json({
        id: r.id,
        title: xss(r.title),
        content: xss(r.content),
        user_id: r.user_id,
        created_at: r.created_at,
      });
    } catch (err) {
      console.error("Update survival guide error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== DELETE SURVIVAL GUIDE ====================
router.delete(
  "/:id",
  actionLimiter,
  authMiddleware, // enforce ownership
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  async (req, res) => {
    if (sendValidation(req, res)) return;

    try {
      const { id } = req.params;
      const { rows } = await pool.query(
        `DELETE FROM survival_guides
         WHERE id = $1 AND user_id = $2
         RETURNING id, title, content, user_id, created_at`,
        [id, req.user.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({
          error: { code: "NOT_FOUND", message: "Guide not found or not owned by user" },
        });
      }

      const r = rows[0];
      res.json({
        message: "Guide deleted successfully",
        deleted: {
          id: r.id,
          title: xss(r.title),
          content: xss(r.content),
          user_id: r.user_id,
          created_at: r.created_at,
        },
      });
    } catch (err) {
      console.error("Delete survival guide error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

module.exports = router;
