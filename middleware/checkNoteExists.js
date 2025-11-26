// middleware/checkNoteExists.js
const pool = require("../db");
const { param, validationResult } = require("express-validator");

const validateNoteId = [
  param("id").isInt({ min: 1 }).withMessage("Note ID must be a positive integer"),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const noteId = parseInt(req.params.id, 10);

    try {
      const { rows } = await pool.query("SELECT * FROM notes WHERE id = $1", [noteId]);
      if (rows.length === 0) {
        return res.status(404).json({ error: "Note not found" });
      }

      // Attach the note to req for reuse in downstream handlers
      req.note = rows[0];
      next();
    } catch (err) {
      console.error("Check note exists error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  },
];

module.exports = validateNoteId;
