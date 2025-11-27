// routes/courses.js
const express = require("express");
const pool = require("../db");
const { actionLimiter } = require("../middleware/rateLimiters");
const { body, param, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/auth"); // admin-only writes

const router = express.Router();

// Helpers
const sendValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: { code: "VALIDATION", details: errors.array() } });
  }
};

// ==================== GET ALL COURSES ====================
router.get("/", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
  const offset = parseInt(req.query.offset, 10) || 0;

  try {
    const { rows } = await pool.query(
      `SELECT id, course_code, course_name, created_at
       FROM courses
       ORDER BY course_code ASC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({ items: rows, limit, offset });
  } catch (err) {
    console.error("Fetch courses error:", err);
    res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
  }
});

// ==================== GET COURSE BY ID ====================
router.get(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  async (req, res) => {
    if (sendValidation(req, res)) return;

    try {
      const { id } = req.params;
      const { rows } = await pool.query(
        `SELECT id, course_code, course_name, created_at
         FROM courses
         WHERE id = $1`,
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Course not found" } });
      }
      res.json(rows[0]);
    } catch (err) {
      console.error("Fetch course error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== CREATE COURSE ====================
router.post(
  "/",
  actionLimiter,
  authMiddleware, //  admin-only
  [
    body("course_code").trim().notEmpty().withMessage("course_code is required"),
    body("course_name").trim().notEmpty().withMessage("course_name is required"),
  ],
  async (req, res) => {
    if (sendValidation(req, res)) return;

    const { course_code, course_name } = req.body;
    try {
      const { rows } = await pool.query(
        `INSERT INTO courses (course_code, course_name)
         VALUES ($1, $2)
         RETURNING id, course_code, course_name, created_at`,
        [course_code, course_name]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({ error: { code: "UNIQUE_CONSTRAINT", message: "Course code already exists" } });
      }
      console.error("Create course error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== UPDATE COURSE ====================
router.put(
  "/:id",
  actionLimiter,
  authMiddleware, // admin-only
  [
    param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
    body("course_code").optional().trim().notEmpty().withMessage("course_code cannot be empty"),
    body("course_name").optional().trim().notEmpty().withMessage("course_name cannot be empty"),
  ],
  async (req, res) => {
    if (sendValidation(req, res)) return;

    const { id } = req.params;
    const { course_code, course_name } = req.body;

    if (!course_code && !course_name) {
      return res.status(400).json({
        error: { code: "NO_FIELDS", message: "At least one field (course_code or course_name) is required to update" }
      });
    }

    try {
      const updates = [];
      const values = [];
      let i = 1;

      if (course_code) {
        updates.push(`course_code = $${i++}`);
        values.push(course_code);
      }
      if (course_name) {
        updates.push(`course_name = $${i++}`);
        values.push(course_name);
      }

      values.push(id);
      const { rows } = await pool.query(
        `UPDATE courses SET ${updates.join(", ")} WHERE id = $${i}
         RETURNING id, course_code, course_name, created_at`,
        values
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Course not found" } });
      }
      res.json(rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({ error: { code: "UNIQUE_CONSTRAINT", message: "Course code already exists" } });
      }
      console.error("Update course error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

// ==================== DELETE COURSE ====================
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
        `DELETE FROM courses WHERE id = $1
         RETURNING id, course_code, course_name, created_at`,
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Course not found" } });
      }
      res.json({ message: "Course deleted successfully", deleted: rows[0] });
    } catch (err) {
      console.error("Delete course error:", err);
      res.status(500).json({ error: { code: "SERVER_ERROR", message: "Internal server error" } });
    }
  }
);

module.exports = router;
