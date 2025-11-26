// routes/qa-answers.js
const express = require("express");
const pool = require("../db");
const authMiddleware = require("../middleware/auth");
const { actionLimiter } = require("../middleware/rateLimiters");
const { body, param, validationResult } = require("express-validator");
const xss = require("xss");

const router = express.Router();

// POST /qa/:postId/answers → Answer a question
router.post(
  "/:postId/answers",
  authMiddleware,
  actionLimiter,
  [
    param("postId").isInt({ min: 1 }),
    body("answer").trim().notEmpty().withMessage("Answer is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { postId } = req.params;
    const userId = req.user.id;
    const answer = xss(req.body.answer);

    try {
      const result = await pool.query(
        `INSERT INTO qa_answers (qa_post_id, user_id, answer)
         VALUES ($1, $2, $3) RETURNING id, answer, created_at`,
        [postId, userId, answer]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Answer error:", err);
      res.status(500).json({ error: "Failed to post answer" });
    }
  }
);

// GET /qa/:postId/answers → Get all answers
router.get("/:postId/answers", param("postId").isInt({ min: 1 }), async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { postId } = req.params;
  try {
    const result = await pool.query(
      `SELECT a.*, u.name AS answerer_name
       FROM qa_answers a
       JOIN users u ON a.user_id = u.id
       WHERE a.qa_post_id = $1
       ORDER BY a.created_at ASC`,
      [postId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch answers" });
  }
});

module.exports = router;