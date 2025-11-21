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

// ✅ 3. JSON middleware & static files
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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


app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

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

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

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
  [
    body("name").isLength({ min: 2 }).withMessage("Name is required"),
    body("email")
      .isEmail().withMessage("Valid email required")
      .custom((value) => {
        if (!value.endsWith("@ustp.edu.ph")) {
          throw new Error("Must use school email");
        }
        return true;
      })
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long"),
  ],
  validate,
  signupLimiter,
  async (req, res, next) => {
    const { name, email, password } = req.body;

    try {
      const hash = await bcrypt.hash(password, 10);

      const result = await pool.query(
        "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email",
        [name, email, hash]
      );

      res.json(result.rows[0]);
    } catch (err) {
      console.error("Signup error:", err);
      if (err.code === "23505") {
        // unique_violation (duplicate email)
        return res.status(409).json({ error: "Email already registered" });
      }
      next(err); // delegate unexpected errors to global handler
    }
  }
);

app.post(
  "/auth/login",
  [
    body("email").isEmail().withMessage("Valid email required").normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  loginLimiter,
  async (req, res, next) => {
    const { email, password } = req.body;

    try {
      const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
      if (result.rows.length === 0) {
        return res.status(400).json({ error: "User not found" });
      }

      const user = result.rows[0];
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) {
        return res.status(400).json({ error: "Invalid password" });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        SECRET,
        { expiresIn: "1h" }
      );
      res.json({ token });
    } catch (err) {
      console.error("Login error:", err);
      next(err);
    }
  }
);

// ---------------- NOTES ----------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: (req, file, cb) => {
    // Generate a safe filename: timestamp + sanitized extension
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, safeName);
  },
});

const fileFilter = (req, file, cb) => {
  // Allowed MIME types
  const allowedMimes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF, DOC, DOCX, PPT, PPTX are allowed."), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});


app.post("/notes/upload", 
   [
    body("subject_id").optional().isInt().withMessage("Subject ID must be an integer"),
    body("title").notEmpty().withMessage("Title is required"),
    body("description").optional().isString(),
  ],
  validate,
  authMiddleware, upload.single("file"), async (req, res) => {
  const { subject_id, title, description } = req.body;
  const user_id = req.user.id;

  // Require file
  if (!req.file) {
    return res.status(400).json({ error: "File upload is required." });
  }

  const file_url = `/uploads/${req.file.filename}`;

  try {
    const result = await pool.query(
      "INSERT INTO notes (user_id, subject_id, title, description, file_url) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [user_id, subject_id, title, description, file_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Upload note error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});


app.get("/notes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM notes ORDER BY upload_date DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch notes error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------- COMMENTS ----------------
app.post("/notes/:id/comments", 
   [
    param("id").isInt().withMessage("Note ID must be an integer"),
    body("comment_text").isLength({ min: 1 }).withMessage("Comment text required"),
  ],
  validate,
  authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { comment_text } = req.body;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      "INSERT INTO comments (note_id, user_id, comment_text) VALUES ($1, $2, $3) RETURNING *",
      [id, user_id, comment_text]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Add comment error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/notes/:id/comments", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM comments WHERE note_id=$1 ORDER BY created_at DESC", [id]);
    res.json(result.rows);
  } catch (err) {
    console.error("Fetch comments error:", err);
    res.status(500).json({ error: err.message });
  }
});

// ---------------- RATINGS ----------------
app.post("/notes/:id/rate", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const user_id = req.user.id;

  try {
    const result = await pool.query(
      "INSERT INTO ratings (note_id, user_id) VALUES ($1,$2) ON CONFLICT (note_id,user_id) DO NOTHING RETURNING *",
      [id, user_id]
    );
    res.json(result.rows[0] || { message: "Already liked" });
  } catch (err) {
    console.error("Rate note error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/notes/:id/ratings", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT COUNT(*) FROM ratings WHERE note_id=$1", [id]);
    res.json({ likes: result.rows[0].count });
  } catch (err) {
    console.error("Fetch ratings error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Server is running!");
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
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


