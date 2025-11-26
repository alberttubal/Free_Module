// routes/courses.js
const express = require("express");
const pool = require("../db");
const { actionLimiter } = require("../middleware/rateLimiters");
const { body, param, validationResult } = require("express-validator");

const router = express.Router();

// ==================== GET ALL COURSES ====================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM courses ORDER BY course_code ASC");
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch courses error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== GET COURSE BY ID ====================
router.get(
  "/:id",
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { id } = req.params;
      const result = await pool.query("SELECT * FROM courses WHERE id = $1", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Fetch course error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ==================== CREATE COURSE ====================
router.post(
  "/",
  actionLimiter,
  [
    body("course_code").trim().notEmpty().withMessage("course_code is required"),
    body("course_name").trim().notEmpty().withMessage("course_name is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { course_code, course_name } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO courses (course_code, course_name) VALUES ($1, $2) RETURNING *",
        [course_code, course_name]
      );
      res.status(201).json(result.rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({ error: "Course code already exists" });
      }
      console.error("Create course error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ==================== UPDATE COURSE ====================
router.put(
  "/:id",
  actionLimiter,
  [
    param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
    body("course_code").optional().trim().notEmpty().withMessage("course_code cannot be empty"),
    body("course_name").optional().trim().notEmpty().withMessage("course_name cannot be empty"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    const { course_code, course_name } = req.body;

    if (!course_code && !course_name) {
      return res.status(400).json({ error: "At least one field (course_code or course_name) is required to update" });
    }

    try {
      const updates = [];
      const values = [];
      let paramIndex = 1;

      if (course_code) {
        updates.push(`course_code = $${paramIndex++}`);
        values.push(course_code);
      }
      if (course_name) {
        updates.push(`course_name = $${paramIndex++}`);
        values.push(course_name);
      }

      values.push(id);
      const result = await pool.query(
        `UPDATE courses SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json(result.rows[0]);
    } catch (err) {
      if (err.code === "23505") {
        return res.status(409).json({ error: "Course code already exists" });
      }
      console.error("Update course error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// ==================== DELETE COURSE ====================
router.delete(
  "/:id",
  actionLimiter,
  param("id").isInt({ min: 1 }).withMessage("id must be a positive integer"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { id } = req.params;
    try {
      const result = await pool.query("DELETE FROM courses WHERE id = $1 RETURNING *", [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Course not found" });
      }
      res.json({ message: "Course deleted successfully", deleted: result.rows[0] });
    } catch (err) {
      console.error("Delete course error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

module.exports = router;
