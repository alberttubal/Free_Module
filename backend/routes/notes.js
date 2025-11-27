
const express = require("express");
const router = express.Router();
const pool = require("../db");
const upload = require("../utils/upload");
const authMiddleware = require("../middleware/auth");
const { body, query, param, validationResult } = require("express-validator");
const fsPromises = require("fs").promises;
const path = require("path");
const sanitize = require("../utils/sanitize");
const xss = require("xss");

// Helper to standardize validation errors
function sendValidation(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ error: { code: "VALIDATION", details: errors.array() } });
    return true;
  }
  return false;
}

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
  async (req, res) => {
    if (sendValidation(req, res)) {
      if (req.file) {
        fsPromises.unlink(req.file.path).catch(e => console.error("Failed to delete orphan file:", e));
      }
      return;
    }

    if (!req.file) {
      return res.status(400).json({ error: { code: "NO_FILE", message: "File is required" } });
    }

    let { title, description, subject_id } = req.body;
    title = sanitize(String(title || "").trim());
    description = sanitize(description ? String(description).trim() : null);

    const user_id = req.user.id;
    const file_url = `/uploads/${req.file.filename}`;

    try {
      const { rows } = await pool.query(
        `INSERT INTO notes (user_id, subject_id, title, description, file_url)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, user_id, subject_id, title, description, file_url, upload_date`,
        [user_id, subject_id ? Number(subject_id) : null, title, description, file_url]
      );

      const r = rows[0];
      res.status(201).json({
        id: r.id,
        user_id: r.user_id,
        subject_id: r.subject_id,
        title: xss(r.title),
        description: r.description ? xss(r.description) : null,
        file_url: r.file_url,
        upload_date: r.upload_date
      });
    } catch (err) {
      if (req.file) {
        await fsPromises.unlink(req.file.path).catch(e => console.error("Failed to delete orphan file:", e));
      }
      console.error("Upload failed:", err);
      res.status(500).json({ error: { code: "UPLOAD_FAILED", message: "Upload failed" } });
    }
  }
);

// ==================== GET SINGLE NOTE ====================
router.get(
  "/:id",
  [
    param("id").isInt({ min: 1 }).withMessage("Invalid note ID"),
  ],
  async (req, res) => {
    if (sendValidation(req, res)) return;

    const noteId = parseInt(req.params.id, 10);

    try {
      const { rows } = await pool.query(
        `SELECT 
          n.id, n.user_id, n.subject_id, n.title, n.description, n.file_url, n.upload_date,
          u.name AS uploader_name,
          COALESCE((SELECT COUNT(*) FROM ratings r WHERE r.note_id = n.id), 0) AS likes,
          COALESCE((SELECT COUNT(*) FROM comments c WHERE c.note_id = n.id), 0) AS comments_count
         FROM notes n
         JOIN users u ON n.user_id = u.id
         WHERE n.id = $1`,
        [noteId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Note not found" } });
      }

      const row = rows[0];
      res.json({
        id: row.id,
        user_id: row.user_id,
        subject_id: row.subject_id,
        title: xss(row.title),
        description: row.description ? xss(row.description) : null,
        file_url: row.file_url,
        uploader_name: xss(row.uploader_name),
        likes: Number(row.likes),
        comments_count: Number(row.comments_count),
        upload_date: row.upload_date
      });
    } catch (err) {
      console.error("Fetch note error:", err.message);
      res.status(500).json({ error: { code: "FETCH_FAILED", message: "Failed to fetch note" } });
    }
  }
);

// ==================== UPDATE NOTE ====================
router.put(
  "/:id",
  authMiddleware,
  upload.single("file"),
  uploadDebug,
  [
    param("id").isInt({ min: 1 }).withMessage("Invalid note ID"),
    body("title").optional().trim().notEmpty().withMessage("Title cannot be empty"),
    body("description").optional().isString(),
    body("subject_id").optional().isInt({ min: 1 }).withMessage("Invalid subject_id"),
  ],
  async (req, res) => {
    if (sendValidation(req, res)) {
      if (req.file) {
        fsPromises.unlink(req.file.path).catch(e => console.error("Failed to delete orphan file:", e));
      }
      return;
    }

    const noteId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    let { title, description, subject_id } = req.body;
    title = title ? sanitize(String(title).trim()) : undefined;
    description = description ? sanitize(String(description).trim()) : undefined;
    subject_id = subject_id ? Number(subject_id) : undefined;
    const newFileUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    try {
      // Fetch current note to verify ownership and get old file_url
      const { rows: currentRows } = await pool.query(
        "SELECT user_id, file_url FROM notes WHERE id = $1",
        [noteId]
      );
      if (currentRows.length === 0) {
        if (req.file) await fsPromises.unlink(req.file.path).catch(e => console.error("Failed to delete orphan file:", e));
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Note not found" } });
      }
      const current = currentRows[0];
      if (current.user_id !== userId) {
        if (req.file) await fsPromises.unlink(req.file.path).catch(e => console.error("Failed to delete orphan file:", e));
        return res.status(403).json({ error: { code: "FORBIDDEN", message: "Not authorized to update this note" } });
      }
      const oldFileUrl = current.file_url;

      // Build dynamic update query
      const updates = [];
      const params = [];
      let paramIndex = 1;
      if (title !== undefined) {
        updates.push(`title = $${paramIndex++}`);
        params.push(title);
      }
      if (description !== undefined) {
        updates.push(`description = $${paramIndex++}`);
        params.push(description);
      }
      if (subject_id !== undefined) {
        updates.push(`subject_id = $${paramIndex++}`);
        params.push(subject_id);
      }
      if (newFileUrl !== undefined) {
        updates.push(`file_url = $${paramIndex++}`);
        params.push(newFileUrl);
      }
      if (updates.length === 0) {
        if (req.file) await fsPromises.unlink(req.file.path).catch(e => console.error("Failed to delete orphan file:", e));
        return res.status(400).json({ error: { code: "NO_CHANGES", message: "No fields provided to update" } });
      }

      // Append WHERE clause params
      params.push(noteId);
      params.push(userId);
      const queryStr = `UPDATE notes SET ${updates.join(", ")} WHERE id = $${paramIndex++} AND user_id = $${paramIndex} RETURNING id, user_id, subject_id, title, description, file_url, upload_date`;
      const { rows } = await pool.query(queryStr, params);

      if (rows.length === 0) {
        if (req.file) await fsPromises.unlink(req.file.path).catch(e => console.error("Failed to delete orphan file:", e));
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Note not found" } });
      }

      const updated = rows[0];

      // Delete old file if a new one was uploaded and old exists
      if (newFileUrl && oldFileUrl) {
        const oldFilePath = path.join(__dirname, "..", oldFileUrl.replace("/uploads/", "uploads/"));
        await fsPromises.unlink(oldFilePath).catch(e => console.error("Failed to delete old file:", e));
      }

      res.json({
        id: updated.id,
        user_id: updated.user_id,
        subject_id: updated.subject_id,
        title: xss(updated.title),
        description: updated.description ? xss(updated.description) : null,
        file_url: updated.file_url,
        upload_date: updated.upload_date
      });
    } catch (err) {
      if (req.file) await fsPromises.unlink(req.file.path).catch(e => console.error("Failed to delete orphan file:", e));
      console.error("Update failed:", err);
      res.status(500).json({ error: { code: "UPDATE_FAILED", message: "Update failed" } });
    }
  }
);

// ==================== DELETE NOTE ====================
router.delete(
  "/:id",
  authMiddleware,
  [
    param("id").isInt({ min: 1 }).withMessage("Invalid note ID"),
  ],
  async (req, res) => {
    if (sendValidation(req, res)) return;

    const noteId = parseInt(req.params.id, 10);
    const userId = req.user.id;

    try {
      const { rows } = await pool.query(
        "DELETE FROM notes WHERE id = $1 AND user_id = $2 RETURNING file_url",
        [noteId, userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Note not found or not owned by user" } });
      }

      const fileUrl = rows[0].file_url;
      if (fileUrl) {
        const filePath = path.join(__dirname, "..", fileUrl.replace("/uploads/", "uploads/"));
        await fsPromises.unlink(filePath).catch(e => console.error("Failed to delete file:", e));
      }

      res.json({ message: "Note deleted successfully" });
    } catch (err) {
      console.error("Delete failed:", err);
      res.status(500).json({ error: { code: "DELETE_FAILED", message: "Delete failed" } });
    }
  }
);

// ==================== LIST NOTES ====================
router.get(
  "/",
  [
    query("limit").optional().isInt({ min: 1 }).withMessage("limit must be a positive integer"),
    query("offset").optional().isInt({ min: 0 }).withMessage("offset must be a non-negative integer"),
    query("subject_id").optional().isInt({ min: 1 }).withMessage("subject_id must be a positive integer"),
  ],
  async (req, res) => {
    if (sendValidation(req, res)) return;

    const rawLimit = parseInt(req.query.limit, 10) || 20;
    const limit = Math.min(rawLimit, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const subjectFilter = req.query.subject_id ? parseInt(req.query.subject_id, 10) : null;

    try {
      let queryStr = `
        SELECT 
          n.id, n.user_id, n.subject_id, n.title, n.description, n.file_url, n.upload_date,
          u.name AS uploader_name,
          COALESCE((SELECT COUNT(*) FROM ratings r WHERE r.note_id = n.id), 0) AS likes,
          COALESCE((SELECT COUNT(*) FROM comments c WHERE c.note_id = n.id), 0) AS comments_count
        FROM notes n
        JOIN users u ON n.user_id = u.id
      `;

      const params = [];
      let i = 1;

      if (subjectFilter) {
        queryStr += ` WHERE n.subject_id = $${i++}`;
        params.push(subjectFilter);
      }

      queryStr += ` ORDER BY n.upload_date DESC LIMIT $${i++} OFFSET $${i++}`;
      params.push(limit, offset);

      const { rows } = await pool.query(queryStr, params);

      const items = rows.map(row => ({
        id: row.id,
        user_id: row.user_id,
        subject_id: row.subject_id,
        title: xss(row.title),
        description: row.description ? xss(row.description) : null,
        file_url: row.file_url,
        uploader_name: xss(row.uploader_name),
        likes: Number(row.likes),
        comments_count: Number(row.comments_count),
        upload_date: row.upload_date
      }));

      res.json({ items, limit, offset });
    } catch (err) {
      console.error("List notes error:", err.message);
      res.status(500).json({ error: { code: "FETCH_FAILED", message: "Failed to fetch notes" } });
    }
  }
);

module.exports = router;
