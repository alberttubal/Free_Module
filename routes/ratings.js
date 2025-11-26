const express = require("express");
const pool = require("../db");
const { actionLimiter } = require("../middleware/rateLimiters");
const { param } = require("express-validator");
const { validationResult } = require("express-validator");
const authMiddleware = require("../middleware/auth");
const checkNoteExists = require("../middleware/checkNoteExists");

const router = express.Router();

// ==================== RATINGS (LIKE / UNLIKE) ====================
router.post(
  "/:id/rate",
  actionLimiter,
  param("id").isInt({ min: 1 }).withMessage("Note ID must be a positive integer"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  authMiddleware,
  checkNoteExists,
  async (req, res) => {
    const noteId = parseInt(req.params.id, 10);
    const user_id = req.user.id;

    try {
      const { rows: existing } = await pool.query(
        "SELECT 1 FROM ratings WHERE note_id = $1 AND user_id = $2",
        [noteId, user_id]
      );

      if (existing.length > 0) {
        // Unlike
        await pool.query(
          "DELETE FROM ratings WHERE note_id = $1 AND user_id = $2",
          [noteId, user_id]
        );
        return res.json({ action: "unliked" });
      }

      // Like
      const { rows } = await pool.query(
        "INSERT INTO ratings (note_id, user_id) VALUES ($1, $2) RETURNING id",
        [noteId, user_id]
      );

      res.status(201).json({ action: "liked", rating_id: rows[0].id });
    } catch (err) {
      console.error("Rate note error:", err);
      res.status(500).json({ error: "Failed to like/unlike note" });
    }
  }
);

// ==================== GET LIKE COUNT ====================
router.get(
  "/:id/ratings",
  param("id").isInt({ min: 1 }).withMessage("Note ID must be a positive integer"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  checkNoteExists,
  async (req, res) => {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    try {
      const countRes = await pool.query(
        "SELECT COUNT(*) FROM ratings WHERE note_id = $1",
        [id]
      );
      const total = parseInt(countRes.rows[0].count);

      const usersRes = await pool.query(
        `SELECT u.id, u.name 
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.note_id = $1
         ORDER BY r.id DESC
         LIMIT $2 OFFSET $3`,
        [id, limit, offset]
      );

      res.json({
        likes: total,
        users: usersRes.rows,
        pagination: { limit, offset, total },
      });
    } catch (err) {
      console.error("Fetch ratings error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

module.exports = router;
