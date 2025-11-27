// routes/ratings.js
const express = require("express");
const pool = require("../db");
const { actionLimiter } = require("../middleware/rateLimiters");
const authMiddleware = require("../middleware/auth");
const checkNoteExists = require("../middleware/checkNoteExists");
const { query, validationResult } = require("express-validator");
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

// ==================== RATINGS (LIKE / UNLIKE) ====================
router.post(
  "/:id/rate",
  actionLimiter,
  authMiddleware,
  checkNoteExists,
  async (req, res) => {
    const noteId = req.note.id;
    const user_id = req.user.id;

    try {
      // Toggle: try delete first; if nothing deleted, insert
      const delRes = await pool.query(
        "DELETE FROM ratings WHERE note_id = $1 AND user_id = $2 RETURNING id",
        [noteId, user_id]
      );
      if (delRes.rowCount > 0) {
        // Return updated count
        const { rows: countRows } = await pool.query(
          "SELECT COUNT(*)::int AS count FROM ratings WHERE note_id = $1",
          [noteId]
        );
        return res.json({ action: "unliked", total_likes: countRows[0].count });
      }

      // Insert like; rely on unique constraint for safety
      await pool.query(
        `INSERT INTO ratings (note_id, user_id)
         VALUES ($1, $2)
         ON CONFLICT (note_id, user_id) DO NOTHING`,
        [noteId, user_id]
      );

      const { rows: countRows } = await pool.query(
        "SELECT COUNT(*)::int AS count FROM ratings WHERE note_id = $1",
        [noteId]
      );

      return res.status(201).json({ action: "liked", total_likes: countRows[0].count });
    } catch (err) {
      console.error("Rate note error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== GET LIKE COUNT ====================
router.get(
  "/:id/ratings",
  checkNoteExists,
  [
    query("limit").optional().isInt({ min: 1 }).withMessage("limit must be a positive integer"),
    query("offset").optional().isInt({ min: 0 }).withMessage("offset must be a non-negative integer"),
  ],
  async (req, res) => {
    if (sendValidation(req, res)) return;

    const noteId = req.note.id;
    const rawLimit = parseInt(req.query.limit, 10) || 20;
    const limit = Math.min(rawLimit, 100);
    const offset = parseInt(req.query.offset, 10) || 0;

    try {
      const { rows: countRows } = await pool.query(
        "SELECT COUNT(*)::int AS count FROM ratings WHERE note_id = $1",
        [noteId]
      );
      const total = countRows[0].count;

      const { rows: users } = await pool.query(
        `SELECT u.id, u.name
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.note_id = $1
         ORDER BY r.id DESC
         LIMIT $2 OFFSET $3`,
        [noteId, limit, offset]
      );

      const safeUsers = users.map(u => ({ id: u.id, name: xss(u.name || "") }));

      res.json({ likes: total, users: safeUsers, limit, offset });
    } catch (err) {
      console.error("Fetch ratings error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

module.exports = router;
