const express = require("express");
const pool = require("../db");
const { actionLimiter } = require("../middleware/rateLimiters");
const authMiddleware = require("../middleware/auth");
const { body, validationResult, param, query } = require("express-validator");
const xss = require("xss");

const router = express.Router();
const answersRouter = require("./qa-answers");


// Helper to standardize validation errors
function sendValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: { code: "VALIDATION", details: errors.array() } });
    return true;
  }
  return false;
}

// ==================== CREATE QA POST ====================
router.post(
  "/",
  actionLimiter,
  authMiddleware,
  [body("question").trim().notEmpty().withMessage("Question is required")],
  async (req, res) => {
    if (sendValidation(req, res)) return;

    try {
      const userId = req.user.id;
      const question = req.body.question.trim();

      const { rows } = await pool.query(
        `INSERT INTO qa_posts (user_id, question)
         VALUES ($1, $2)
         RETURNING id, user_id, question, created_at`,
        [userId, question]
      );

      const r = rows[0];
      res.status(201).json({
        id: r.id,
        user_id: r.user_id,
        question: xss(r.question),
        created_at: r.created_at
      });
    } catch (err) {
      console.error("Error creating QA post:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== LIST ALL QA POSTS ====================
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
        `SELECT q.id, q.user_id, q.question, q.created_at, u.name AS author_name
         FROM qa_posts q
         JOIN users u ON q.user_id = u.id
         ORDER BY q.created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const items = rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        question: xss(row.question),
        author_name: xss(row.author_name),
        created_at: row.created_at
      }));

      res.json({ items, limit, offset });
    } catch (err) {
      console.error("Error fetching QA posts:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== GET SINGLE QA POST ====================
router.get(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer")],
  async (req, res) => {
    if (sendValidation(req, res)) return;

    try {
      const { id } = req.params;
      const { rows } = await pool.query(
        `SELECT q.id, q.user_id, q.question, q.created_at, u.name AS author_name
         FROM qa_posts q
         JOIN users u ON q.user_id = u.id
         WHERE q.id = $1`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "QA post not found" } });
      }

      const r = rows[0];
      res.json({
        id: r.id,
        user_id: r.user_id,
        question: xss(r.question),
        author_name: xss(r.author_name),
        created_at: r.created_at
      });
    } catch (err) {
      console.error("Error fetching QA post:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== UPDATE QA POST ====================
router.put(
  "/:id",
  authMiddleware,
  [
    param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer"),
    body("question").trim().notEmpty().withMessage("Question is required"),
  ],
  async (req, res) => {
    if (sendValidation(req, res)) return;

    try {
      const { id } = req.params;
      const userId = req.user.id;
      const question = req.body.question.trim();

      const { rows } = await pool.query(
        `UPDATE qa_posts
         SET question = $1
         WHERE id = $2 AND user_id = $3
         RETURNING id, user_id, question, created_at`,
        [question, id, userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "QA post not found or not owned by user" } });
      }

      const r = rows[0];
      res.json({
        id: r.id,
        user_id: r.user_id,
        question: xss(r.question),
        created_at: r.created_at
      });
    } catch (err) {
      console.error("Error updating QA post:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== DELETE QA POST ====================
router.delete(
  "/:id",
  authMiddleware,
  [param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer")],
  async (req, res) => {
    if (sendValidation(req, res)) return;

    try {
      const { id } = req.params;
      const userId = req.user.id;

      const { rows } = await pool.query(
        `DELETE FROM qa_posts
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [id, userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "QA post not found or not owned by user" } });
      }

      res.json({ message: "QA post deleted successfully" });
    } catch (err) {
      console.error("Error deleting QA post:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

router.use("/:postId/answers", answersRouter);
module.exports = router;
