// routes/qa-answers.js
const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { actionLimiter } = require("../middleware/rateLimiters");
const { body, param, query, validationResult } = require("express-validator");
const xss = require("xss");

const router = express.Router({ mergeParams: true });

function sendValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: { code: "VALIDATION", details: errors.array() } });
    return true;
  }
  return false;
}

// POST /qa/:postId/answers → Answer a question
router.post(
  "/",
  authMiddleware,
  actionLimiter,
  [
    param("postId").isInt({ min: 1 }).withMessage("postId must be a positive integer"),
    body("answer").trim().notEmpty().withMessage("Answer is required"),
  ],
  async (req, res) => {
    if (sendValidation(req, res)) return;

    const { postId } = req.params;
    const userId = req.user.id;
    const answer = xss(req.body.answer);

    try {
      const { rows } = await pool.query(
        `INSERT INTO qa_answers (qa_post_id, user_id, answer)
         VALUES ($1, $2, $3)
         RETURNING id, qa_post_id, user_id, answer, created_at`,
        [postId, userId, answer]
      );

      const r = rows[0];
      res.status(201).json({
        id: r.id,
        qa_post_id: r.qa_post_id,
        user_id: r.user_id,
        answer: xss(r.answer),
        created_at: r.created_at
      });
    } catch (err) {
      console.error("Answer error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Failed to post answer" } });
    }
  }
);

// GET /qa/:postId/answers → Get all answers
router.get(
  "/",
  [
    param("postId").isInt({ min: 1 }).withMessage("postId must be a positive integer"),
    query("limit").optional().isInt({ min: 1 }).withMessage("limit must be a positive integer"),
    query("offset").optional().isInt({ min: 0 }).withMessage("offset must be a non-negative integer"),
  ],
  async (req, res) => {
    if (sendValidation(req, res)) return;

    const { postId } = req.params;
    const rawLimit = parseInt(req.query.limit, 10) || 20;
    const limit = Math.min(rawLimit, 100);
    const offset = parseInt(req.query.offset, 10) || 0;

    try {
      const { rows } = await pool.query(
        `SELECT a.id, a.qa_post_id, a.user_id, a.answer, a.created_at, u.name AS answerer_name
         FROM qa_answers a
         JOIN users u ON a.user_id = u.id
         WHERE a.qa_post_id = $1
         ORDER BY a.created_at ASC
         LIMIT $2 OFFSET $3`,
        [postId, limit, offset]
      );

      const items = rows.map(r => ({
        id: r.id,
        qa_post_id: r.qa_post_id,
        user_id: r.user_id,
        answer: xss(r.answer || ""),
        answerer_name: xss(r.answerer_name || ""),
        created_at: r.created_at
      }));

      res.json({ items, limit, offset });
    } catch (err) {
      console.error("Fetch answers error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Failed to fetch answers" } });
    }
  }
);

module.exports = router;
