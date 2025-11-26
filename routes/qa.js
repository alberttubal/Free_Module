const express = require("express");
const pool = require("../db");
const { actionLimiter } = require("../middleware/rateLimiters");
const authMiddleware = require("../middleware/auth");
const { body, validationResult, param } = require("express-validator");
const xss = require("xss");

const router = express.Router();

// ==================== CREATE QA POST ====================
router.post(
  "/",
  actionLimiter,
  authMiddleware,
  [body("question").trim().notEmpty().withMessage("Question is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = req.user.id;
      const { question } = req.body;

      const result = await pool.query(
        "INSERT INTO qa_posts (user_id, question) VALUES ($1, $2) RETURNING *",
        [userId, question]
      );

      res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Error creating QA post:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ==================== LIST ALL QA POSTS ====================
router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;

  try {
    const result = await pool.query(
      `SELECT q.*, u.name AS author_name
       FROM qa_posts q
       JOIN users u ON q.user_id = u.id
       ORDER BY q.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const safePosts = result.rows.map((row) => ({
      ...row,
      question: xss(row.question),
      author_name: xss(row.author_name),
    }));

    res.json(safePosts);
  } catch (err) {
    console.error("Error fetching QA posts:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== GET SINGLE QA POST ====================
router.get(
  "/:id",
  [param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const result = await pool.query(
        `SELECT q.*, u.name AS author_name
         FROM qa_posts q
         JOIN users u ON q.user_id = u.id
         WHERE q.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "QA post not found" });
      }

      const row = result.rows[0];
      res.json({
        ...row,
        question: xss(row.question),
        author_name: xss(row.author_name),
      });
    } catch (err) {
      console.error("Error fetching QA post:", err);
      res.status(500).json({ error: "Internal server error" });
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { question } = req.body;
      const userId = req.user.id;

      const result = await pool.query(
        `UPDATE qa_posts
         SET question = $1
         WHERE id = $2 AND user_id = $3
         RETURNING *`,
        [question, id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "QA post not found or not owned by user" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Error updating QA post:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ==================== DELETE QA POST ====================
router.delete(
  "/:id",
  authMiddleware,
  [param("id").isInt({ min: 1 }).withMessage("ID must be a positive integer")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const userId = req.user.id;

      const result = await pool.query(
        "DELETE FROM qa_posts WHERE id = $1 AND user_id = $2 RETURNING *",
        [id, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "QA post not found or not owned by user" });
      }

      res.json({ message: "QA post deleted successfully" });
    } catch (err) {
      console.error("Error deleting QA post:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
