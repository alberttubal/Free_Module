// routes/comments.js
const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { actionLimiter } = require("../middleware/rateLimiters");
const { body, param, validationResult } = require("express-validator");
const checkNoteExists = require("../middleware/checkNoteExists"); // validates note and attaches req.note
const xss = require("xss");

const router = express.Router();

// ==================== CREATE COMMENT ====================
router.post(
  "/:id/comments",
  authMiddleware,
  actionLimiter,
  [
    param("id").isInt({ min: 1 }).withMessage("Note ID must be a positive integer"),
    body("comment_text").trim().notEmpty().withMessage("Comment text is required"),
  ],
  checkNoteExists,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { code: "VALIDATION", details: errors.array() } });
    }

    const noteId = req.note.id;
    const user_id = req.user.id;
    const comment_text = xss(req.body.comment_text);

    try {
      const result = await pool.query(
        `INSERT INTO comments (note_id, user_id, comment_text)
         VALUES ($1, $2, $3)
         RETURNING id, note_id, user_id, comment_text, created_at`,
        [noteId, user_id, comment_text]
      );

      const row = result.rows[0];
      res.status(201).json({
        id: row.id,
        note_id: row.note_id,
        user_id: row.user_id,
        comment_text: xss(row.comment_text),
        created_at: row.created_at,
      });
    } catch (err) {
      console.error("Add comment error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== GET COMMENTS FOR A NOTE ====================
router.get(
  "/:id/comments",
  param("id").isInt({ min: 1 }).withMessage("Note ID must be a positive integer"),
  checkNoteExists,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { code: "VALIDATION", details: errors.array() } });
    }

    const noteId = req.note.id;
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const offset = parseInt(req.query.offset, 10) || 0;

    try {
      const { rows } = await pool.query(
        `SELECT c.id, c.note_id, c.user_id, c.comment_text, c.created_at, u.name AS user_name
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.note_id = $1
         ORDER BY c.created_at DESC
         LIMIT $2 OFFSET $3`,
        [noteId, limit, offset]
      );

      const safe = rows.map(r => ({
        id: r.id,
        note_id: r.note_id,
        user_id: r.user_id,
        comment_text: xss(r.comment_text),
        user_name: xss(r.user_name),
        created_at: r.created_at,
      }));

      res.json({ items: safe, limit, offset });
    } catch (err) {
      console.error("Fetch comments error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== DELETE COMMENT ====================
router.delete(
  "/:id/comments/:commentId",
  authMiddleware,
  actionLimiter,
  [
    param("id").isInt({ min: 1 }).withMessage("Note ID must be a positive integer"),
    param("commentId").isInt({ min: 1 }).withMessage("Comment ID must be a positive integer"),
  ],
  checkNoteExists,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: { code: "VALIDATION", details: errors.array() } });
    }

    const noteId = req.note.id;
    const { commentId } = req.params;
    const user_id = req.user.id;

    try {
      const result = await pool.query(
        `DELETE FROM comments
         WHERE id = $1 AND user_id = $2 AND note_id = $3
         RETURNING id, note_id, user_id, comment_text, created_at`,
        [commentId, user_id, noteId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Comment not found or not owned by user" } });
      }

      res.json({ message: "Comment deleted successfully", deleted: result.rows[0] });
    } catch (err) {
      console.error("Delete comment error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

module.exports = router;
