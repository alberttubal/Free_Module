const express = require("express");
const router = express.Router();
const pool = require("../db");
const upload = require("../utils/upload");
const authMiddleware = require("../middleware/auth");
const { body, validationResult } = require("express-validator");
const fsPromises = require("fs").promises;
const sanitize = require("../utils/sanitize");
const xss = require("xss");

// Debug middleware (only logs in development)
function uploadDebug(req, res, next) {
  if (process.env.NODE_ENV === "development") {
    console.log("UPLOAD DEBUG → req.body:", req.body);
    console.log("UPLOAD DEBUG → req.file:", req.file?.originalname || "NO FILE");
  }
  next();
}

// ==================== NOTES UPLOAD ====================
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  uploadDebug,
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").optional().isString(),
    body("subject_id").optional().isInt({ min: 1 }).withMessage("Invalid subject_id"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        fsPromises.unlink(req.file.path).catch((e) =>
          console.error("Failed to delete orphan file:", e)
        );
      }
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "File is required" });

    let { title, description, subject_id } = req.body;
    title = sanitize(title);
    description = sanitize(description);

    const user_id = req.user.id;
    const file_url = `/uploads/${req.file.filename}`;

    try {
      const { rows } = await pool.query(
        `INSERT INTO notes (user_id, subject_id, title, description, file_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [user_id, subject_id || null, title, description || null, file_url]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      if (req.file) {
        await fsPromises.unlink(req.file.path).catch((e) =>
          console.error("Failed to delete orphan file:", e)
        );
      }
      console.error("Upload failed:", err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);

// ==================== LIST NOTES ====================
router.get("/", async (req, res) => {
  const limit = parseInt(req.query.limit, 10) || 20;
  const offset = parseInt(req.query.offset, 10) || 0;
  const subjectFilter = req.query.subject_id ? parseInt(req.query.subject_id, 10) : null;

  try {
    let query = `
      SELECT 
        n.*,
        u.name AS uploader_name,
        COALESCE((SELECT COUNT(*) FROM ratings r WHERE r.note_id = n.id), 0) AS likes,
        COALESCE((SELECT COUNT(*) FROM comments c WHERE c.note_id = n.id), 0) AS comments_count
      FROM notes n
      JOIN users u ON n.user_id = u.id
    `;

    const params = [];
    let paramIndex = 1;

    if (subjectFilter) {
      query += ` WHERE n.subject_id = $${paramIndex++}`;
    }

    query += ` ORDER BY n.upload_date DESC`;
    query += ` LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
    params.push(...(subjectFilter ? [subjectFilter] : []), limit, offset);

    const result = await pool.query(query, params);

    res.json(
      result.rows.map((row) => ({
        ...row,
        title: xss(row.title),
        description: row.description ? xss(row.description) : null,
        uploader_name: xss(row.uploader_name),
      }))
    );
  } catch (err) {
    console.error("List notes error:", err.message);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

module.exports = router;
