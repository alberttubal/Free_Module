// routes/subjects.js
const express = require("express");
const pool = require("../db");
const { actionLimiter } = require("../middleware/rateLimiters");
const { body, param, validationResult } = require("express-validator");

const router = express.Router();

// ==================== GET ALL SUBJECTS ====================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM subjects ORDER BY subject_name ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch subjects error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== GET SUBJECTS FOR A COURSE ====================
router.get(
  "/course/:course_id",
  param("course_id").isInt({ min: 1 }).withMessage("course_id must be a positive integer"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { course_id } = req.params;
      const result = await pool.query(
        "SELECT * FROM subjects WHERE course_id = $1 ORDER BY subject_name ASC",
        [course_id]
      );
      res.json(result.rows);
    } catch (err) {
      console.error("Fetch course subjects error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ==================== GET SUBJECT BY ID ====================
router.get(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { id } = req.params;
      const result = await pool.query("SELECT * FROM subjects WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Subject not found" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Fetch subject error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ==================== CREATE SUBJECT ====================
router.post(
  "/",
  actionLimiter,
  [
    body("course_id").isInt({ min: 1 }).withMessage("course_id must be a positive integer"),
    body("subject_name").trim().notEmpty().withMessage("subject_name is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { course_id, subject_name } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO subjects (course_id, subject_name) VALUES ($1, $2) RETURNING *",
        [course_id, subject_name]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({ error: "Subject name already exists for this course" });
      } else if (err.code === "23503") {
        return res.status(400).json({ error: "Invalid course_id (course does not exist)" });
      }
      console.error("Create subject error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ==================== UPDATE SUBJECT ====================
router.put(
  "/:id",
  actionLimiter,
  [
    param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
    body("course_id").optional().isInt({ min: 1 }).withMessage("course_id must be a positive integer"),
    body("subject_name").optional().trim().notEmpty().withMessage("subject_name cannot be empty"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { course_id, subject_name } = req.body;

    if (!course_id && !subject_name) {
      return res.status(400).json({ error: "At least one field (course_id or subject_name) is required to update" });
    }

    try {
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (course_id) {
        updates.push(`course_id = $${paramIndex++}`);
        values.push(course_id);
      }
      if (subject_name) {
        updates.push(`subject_name = $${paramIndex++}`);
        values.push(subject_name);
      }

      values.push(id);
      const result = await pool.query(
        `UPDATE subjects SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Subject not found" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({ error: "Subject name already exists for this course" });
      } else if (err.code === "23503") {
        return res.status(400).json({ error: "Invalid course_id (course does not exist)" });
      }
      console.error("Update subject error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ==================== DELETE SUBJECT ====================
router.delete(
  "/:id",
  actionLimiter,
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    try {
      const result = await pool.query("DELETE FROM subjects WHERE id = $1 RETURNING *", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Subject not found" });
      }
      res.json({ message: "Subject deleted successfully", deleted: result.rows[0] });
    } catch (err) {
      console.error("Delete subject error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
