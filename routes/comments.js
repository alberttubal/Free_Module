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
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const noteId = req.note.id;
    const user_id = req.user.id;
    const comment_text = xss(req.body.comment_text);

    try {
      const result = await pool.query(
        "INSERT INTO comments (note_id, user_id, comment_text) VALUES ($1, $2, $3) RETURNING *",
        [noteId, user_id, comment_text]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Add comment error:", err);
      res.status(500).json({ error: "Internal server error" });
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
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const noteId = req.note.id;

    try {
      const result = await pool.query(
        `SELECT c.*, u.name AS user_name 
         FROM comments c 
         JOIN users u ON c.user_id = u.id 
         WHERE c.note_id = $1 
         ORDER BY c.created_at DESC`,
        [noteId]
      );

      const safeResult = result.rows.map(row => ({
        ...row,
        comment_text: xss(row.comment_text),
        user_name: xss(row.user_name),
      }));

      res.json(safeResult);
    } catch (err) {
      console.error("Fetch comments error:", err);
      res.status(500).json({ error: "Internal server error" });
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
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { commentId } = req.params;
    const user_id = req.user.id;

    try {
      const result = await pool.query(
        "DELETE FROM comments WHERE id = $1 AND user_id = $2 RETURNING *",
        [commentId, user_id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Comment not found or not owned by user" });
      }
      res.json({ message: "Comment deleted successfully", deleted: result.rows[0] });
    } catch (err) {
      console.error("Delete comment error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
