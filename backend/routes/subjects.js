// routes/subjects.js
const express = require("express");
const pool = require("../db");
const { actionLimiter } = require("../middleware/rateLimiters");
const { body, param, query, validationResult } = require("express-validator");
const xss = require("xss");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

function sendValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: { code: "VALIDATION", details: errors.array() } });
    return true;
  }
  return false;
}

// ==================== GET ALL SUBJECTS ====================
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
        `SELECT id, course_id, subject_name
         FROM subjects
         ORDER BY subject_name ASC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );
      const items = rows.map(r => ({
        id: r.id,
        course_id: r.course_id,
        subject_name: xss(r.subject_name)
      }));
      res.json({ items, limit, offset });
    } catch (err) {
      console.error("Fetch subjects error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== GET SUBJECTS FOR A COURSE ====================
router.get(
  "/course/:course_id",
  param("course_id").isInt({ min: 1 }).withMessage("course_id must be a positive integer"),
  [
    query("limit").optional().isInt({ min: 1 }),
    query("offset").optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    if (sendValidation(req, res)) return;

    const rawLimit = parseInt(req.query.limit, 10) || 20;
    const limit = Math.min(rawLimit, 100);
    const offset = parseInt(req.query.offset, 10) || 0;

    try {
      const { course_id } = req.params;
      const { rows } = await pool.query(
        `SELECT id, course_id, subject_name
         FROM subjects
         WHERE course_id = $1
         ORDER BY subject_name ASC
         LIMIT $2 OFFSET $3`,
        [course_id, limit, offset]
      );
      const items = rows.map(r => ({
        id: r.id,
        course_id: r.course_id,
        subject_name: xss(r.subject_name)
      }));
      res.json({ items, limit, offset });
    } catch (err) {
      console.error("Fetch course subjects error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== GET SUBJECT BY ID ====================
router.get(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  async (req, res) => {
    if (sendValidation(req, res)) return;

    try {
      const { id } = req.params;
      const { rows } = await pool.query(
        `SELECT id, course_id, subject_name
         FROM subjects
         WHERE id = $1`,
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Subject not found" } });
      }
      const r = rows[0];
      res.json({
        id: r.id,
        course_id: r.course_id,
        subject_name: xss(r.subject_name)
      });
    } catch (err) {
      console.error("Fetch subject error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== CREATE SUBJECT ====================
router.post(
  "/",
  actionLimiter,
  authMiddleware, // admin-only
  [
    body("course_id").isInt({ min: 1 }).withMessage("course_id must be a positive integer"),
    body("subject_name").trim().notEmpty().withMessage("subject_name is required"),
  ],
  async (req, res) => {
    if (sendValidation(req, res)) return;

    const { course_id, subject_name } = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO subjects (course_id, subject_name)
         VALUES ($1, $2)
         RETURNING id, course_id, subject_name`,
        [course_id, subject_name]
      );
      const r = rows[0];
      res.status(201).json({
        id: r.id,
        course_id: r.course_id,
        subject_name: xss(r.subject_name)
      });
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({ error: { code: "UNIQUE_CONSTRAINT", message: "Subject name already exists for this course" } });
      } else if (err.code === "23503") {
        return res.status(400).json({ error: { code: "FOREIGN_KEY", message: "Invalid course_id (course does not exist)" } });
      }
      console.error("Create subject error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== UPDATE SUBJECT ====================
router.put(
  "/:id",
  actionLimiter,
  authMiddleware, //admin only
  [
    param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
    body("course_id").optional().isInt({ min: 1 }).withMessage("course_id must be a positive integer"),
    body("subject_name").optional().trim().notEmpty().withMessage("subject_name cannot be empty"),
  ],
  async (req, res) => {
    if (sendValidation(req, res)) return;

    const { id } = req.params;
    const { course_id, subject_name } = req.body;

    if (!course_id && !subject_name) {
      return res.status(400).json({
        error: { code: "NO_FIELDS", message: "At least one field (course_id or subject_name) is required to update" }
      });
    }

    try {
      const updates = [];
      const values = [];
      let i = 1;

      if (course_id) {
        updates.push(`course_id = $${i++}`);
        values.push(course_id);
      }
      if (subject_name) {
        updates.push(`subject_name = $${i++}`);
        values.push(subject_name.trim());
      }

      values.push(id);

      const { rows } = await pool.query(
        `UPDATE subjects
         SET ${updates.join(", ")}
         WHERE id = $${i}
         RETURNING id, course_id, subject_name`,
        values
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Subject not found" } });
      }

      const r = rows[0];
      res.json({
        id: r.id,
        course_id: r.course_id,
        subject_name: xss(r.subject_name)
      });
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({ error: { code: "UNIQUE_CONSTRAINT", message: "Subject name already exists for this course" } });
      } else if (err.code === "23503") {
        return res.status(400).json({ error: { code: "FOREIGN_KEY", message: "Invalid course_id (course does not exist)" } });
      }
      console.error("Update subject error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== DELETE SUBJECT ====================
router.delete(
  "/:id",
  actionLimiter,
  authMiddleware, // admin-only
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  async (req, res) => {
    if (sendValidation(req, res)) return;

    const { id } = req.params;
    try {
      const { rows } = await pool.query(
        `DELETE FROM subjects
         WHERE id = $1
         RETURNING id, course_id, subject_name`,
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Subject not found" } });
      }
      const r = rows[0];
      res.json({
        message: "Subject deleted successfully",
        deleted: {
          id: r.id,
          course_id: r.course_id,
          subject_name: xss(r.subject_name)
        }
      });
    } catch (err) {
      console.error("Delete subject error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

module.exports = router;
