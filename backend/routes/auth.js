require("dotenv").config();

const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const { body, param, validationResult } = require("express-validator");
const rateLimit = require("express-rate-limit");
const xss = require("xss");
const helmet = require("helmet");
const fsPromises = fs.promises;


// ———————————————— MULTER CONFIG (updated limit) ————————————————
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];
  if (allowedMimes.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only PDF, DOC, DOCX, PPT, PPTX files are allowed"), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // ← Bug 2: 20 MB → 5 MB
});



// ✅ 1. Handle JWT secret early
let SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  if (process.env.NODE_ENV === "development") {
    console.warn("⚠️ Using fallback dev JWT secret — do NOT use in production!");
    SECRET = "dev_secret";
  } else {
    console.error("❌ JWT_SECRET environment variable is required in production.");
    process.exit(1);
  }
}

const app = express();
const PORT = process.env.PORT || 4000;

// ✅ 2. Configure CORS once, right after app creation
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
// ———————————————— MIDDLEWARES ————————————————
app.use(helmet()); // ← Bug 3: Security headers (CSP, HSTS, etc.)

// Global rate limiter for spammy actions (comments, likes, etc.)
const actionLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,   // 5 minutes
  max: 30,                   // 30 actions per 5 min per IP
  message: { error: "Too many actions, please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ———————————————— HELPER: sanitize XSS ————————————————
const sanitize = (str) => (str ? xss(str, { whiteList: {} }) : str); // strips ALL tags



// ✅ 4. Database pool setup here
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});


// Optionally test connection
pool.connect()
  .then(client => {
    console.log("✅ Connected to PostgreSQL");
    client.release(); // important!
  })
  .catch(err => console.error("❌ Database connection error", err));


// Ensure uploads directory exists at startup
const uploadsDir = path.join(__dirname, "uploads");
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Uploads directory ready:", uploadsDir);
} catch (err) {
  console.error("❌ Failed to create uploads directory:", err);
  process.exit(1); // Exit if directory can't be created
}
// ---------------- AUTH MIDDLEWARE ----------------
function authMiddleware(req, res, next) {
  const authHeader = req.headers["authorization"];

  // Require Bearer scheme explicitly
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authorization header must use Bearer scheme" });
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Missing token" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

const checkNoteExists = async (req, res, next) => {
  const noteId = parseInt(req.params.id, 10);
  try {
    const { rows } = await pool.query("SELECT 1 FROM notes WHERE id = $1", [noteId]);
    if (rows.length === 0) return res.status(404).json({ error: "Note not found" });
    next();
  } catch (err) {
    console.error("Check note exists error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Limit login attempts: 5 per minute per IP
const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: { error: "Too many login attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit signup attempts: 10 per 15 minutes per IP
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: "Too many signup attempts. Please wait before retrying." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------------- AUTH ROUTES ----------------
app.post(
  "/auth/signup",
  signupLimiter,
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters"),
    body("email")
      .trim()
      .isEmail().withMessage("Valid email required")
      .custom((value) => {
        if (!value.endsWith("@ustp.edu.ph")) throw new Error("Must use USTP email");
        return true;
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  async (req, res) => {
    let { name, email, password } = req.body;
    name = sanitize(name); // XSS safe

    try {
      const hash = await bcrypt.hash(password, 10);
      const { rows } = await pool.query(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, created_at",
        [name, email, hash]
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.error("Signup error:", err);
      if (err.code === "23505") return res.status(409).json({ error: "Email already in use" });
      res.status(500).json({ error: "Signup failed" });
    }
  }
);

app.post(
  "/auth/login",
  loginLimiter,
  [
    body("email").trim().isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").trim().notEmpty().withMessage("Password required"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  async (req, res) => {
    const { email, password } = req.body;

    try {
      const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (rows.length === 0) return res.status(400).json({ error: "Invalid credentials" });

      const user = rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return res.status(400).json({ error: "Invalid credentials" });

      const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1h" });
      res.json({ token });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ error: "Login failed" });
    }
  }
);

// ==================== USER PROFILE ====================
app.get("/users/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Fetch user profile error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// ==================== NOTES UPLOAD ====================
app.post(
  "/notes/upload",
  authMiddleware,
  upload.single("file"),
  (req, res, next) => {
    console.log("UPLOAD DEBUG → req.body:", req.body);
    console.log("UPLOAD DEBUG → req.file:", req.file?.originalname || "NO FILE");
    next();
  },
  [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").optional().isString(),
    body("subject_id").optional().isInt({ min: 1 }).withMessage("Invalid subject_id"),
  ],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        fsPromises.unlink(req.file.path).catch((unlinkErr) =>
          console.error("Failed to delete orphan file:", unlinkErr)
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
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [user_id, subject_id || null, title, description || null, file_url]
      );
      res.json(rows[0]);
    } catch (err) {
      if (req.file) {
        await fsPromises.unlink(req.file.path).catch((unlinkErr) =>
          console.error("Failed to delete orphan file:", unlinkErr)
        );
      }
      console.error("Upload failed:", err);
      res.status(500).json({ error: "Upload failed" });
    }
  }
);


// ---------------- LIST NOTES (GET) ----------------
app.get("/notes", async (req, res) => {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const subjectFilter = req.query.subject_id || null;

  try {
    let query = `
      SELECT 
        n.*,
        u.name AS uploader_name,
        (SELECT COUNT(*) FROM ratings r WHERE r.note_id = n.id) AS likes,
        (SELECT COUNT(*) FROM comments c WHERE c.note_id = n.id) AS comments
      FROM notes n
      JOIN users u ON n.user_id = u.id
    `;

    const params = [];

    // If filtering by subject
    if (subjectFilter) {
      query += ` WHERE n.subject_id = $1 `;
      params.push(subjectFilter);
    }

    // Ordering and pagination
    params.push(limit);
    params.push(offset);

    query += ` ORDER BY n.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length};`;

    const result = await pool.query(query, params);

    // OPTIONAL: sanitize titles/descriptions for display
    const safeNotes = result.rows.map((row) => ({
      ...row,
      title: xss(row.title),
      description: row.description ? xss(row.description) : null,
      uploader_name: xss(row.uploader_name),
    }));

    res.json(safeNotes);
  } catch (err) {
    console.error("List notes error:", err);
    res.status(500).json({ error: "Failed to fetch notes" });
  }
});

// ==================== COMMENTS ====================


app.post(
  "/notes/:id/comments",
  actionLimiter,
  param("id").isInt({ min: 1 }).withMessage("Note ID must be a positive integer"),
  body("comment_text")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment must be 1-1000 characters"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  authMiddleware,
  checkNoteExists,
  async (req, res) => {
    const { id } = req.params;
    let { comment_text } = req.body;
    comment_text = sanitize(comment_text);
    const user_id = req.user.id;

    try {
      const { rows } = await pool.query(
        `INSERT INTO comments (note_id, user_id, comment_text) VALUES ($1, $2, $3) RETURNING id, note_id, user_id, comment_text, created_at`,
        [id, user_id, comment_text]
      );

      // Join user name for immediate response (optional but nice)
      const { rows: userRows } = await pool.query(
        "SELECT name FROM users WHERE id = $1",
        [user_id]
      );

      res.status(201).json({
        ...rows[0],
        user_name: userRows[0]?.name || "Anonymous",
      });
    } catch (err) {
      console.error("Add comment error:", err);
      res.status(500).json({ error: "Failed to add comment" });
    }
  }
);

app.get(
  "/notes/:id/comments",
  // No rate limit needed for GET, or use a lighter one if abused
  param("id").isInt({ min: 1 }).withMessage("Note ID must be a positive integer"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  checkNoteExists,
  async (req, res) => {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    try {
      const result = await pool.query(
        `SELECT 
           c.id,
           c.comment_text,
           c.created_at,
           u.name AS user_name
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.note_id = $1
         ORDER BY c.created_at DESC 
         LIMIT $2 OFFSET $3`,
        [id, limit, offset]
      );

      // Optional: also return total count for frontend pagination
      const totalRes = await pool.query(
        "SELECT COUNT(*) FROM comments WHERE note_id = $1",
        [id]
      );
      const total = parseInt(totalRes.rows[0].count);

      // Sanitize output (defense in depth)
      const safeComments = result.rows.map((c) => ({
        ...c,
        comment_text: xss(c.comment_text),
        user_name: xss(c.user_name || ""),
      }));

      res.json({
        comments: safeComments,
        pagination: {
          limit,
          offset,
          total,
        },
      });
    } catch (err) {
      console.error("Fetch comments error:", err);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  }
);

// ==================== RATINGS (LIKE / UNLIKE) ====================
app.post(
  "/notes/:id/rate",
  actionLimiter,
  param("id").isInt({ min: 1 }).withMessage("Note ID must be a positive integer"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  authMiddleware,
  checkNoteExists,
  async (req, res) => {
    const noteId = parseInt(req.params.id, 10);
    const user_id = req.user.id;

    try {
      const { rows: existing } = await pool.query(
        "SELECT 1 FROM ratings WHERE note_id = $1 AND user_id = $2",
        [noteId, user_id]
      );

      if (existing.length > 0) {
        // Unlike
        await pool.query(
          "DELETE FROM ratings WHERE note_id = $1 AND user_id = $2",
          [noteId, user_id]
        );
        return res.json({ action: "unliked" });
      }

      // Like
      const { rows } = await pool.query(
        "INSERT INTO ratings (note_id, user_id) VALUES ($1, $2) RETURNING id",
        [noteId, user_id]
      );

      res.status(201).json({ action: "liked", rating_id: rows[0].id });
    } catch (err) {
      console.error("Rate note error:", err);
      res.status(500).json({ error: "Failed to like/unlike note" });
    }
  }
);

// ==================== GET LIKE COUNT ====================
app.get(
  "/notes/:id/ratings",
  param("id").isInt({ min: 1 }).withMessage("Note ID must be a positive integer"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  },
  checkNoteExists,
  async (req, res) => {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    try {
      const countRes = await pool.query(
        "SELECT COUNT(*) FROM ratings WHERE note_id = $1",
        [id]
      );
      const total = parseInt(countRes.rows[0].count);

      const usersRes = await pool.query(
        `SELECT u.id, u.name 
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.note_id = $1
         ORDER BY r.id DESC
         LIMIT $2 OFFSET $3`,
        [id, limit, offset]
      );

      res.json({
        likes: total,
        users: usersRes.rows,
        pagination: { limit, offset, total },
      });
    } catch (err) {
      console.error("Fetch ratings error:", err);
      res.status(500).json({ error: err.message });
    }
  }
);

// Start server BEFORE shutdown handlers
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// ---------Global error handlers------------
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  shutdown();
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  shutdown();
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err.message.includes("Only PDF") || err.message.includes("allowed")) {
    return res.status(400).json({ error: err.message });
  }
  next(err);
});


app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Graceful shutdown logic
function shutdown() {
  console.log("Shutting down gracefully...");
  server.close(() => {
    pool.end(() => {
      console.log("Database pool closed.");
      process.exit(0);
    });
  });
  // Force exit if shutdown takes too long
  setTimeout(() => process.exit(1), 10000).unref();
}

// Handle Ctrl+C and termination signals
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
