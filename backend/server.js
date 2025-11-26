require("dotenv").config();

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const xss = require("xss");
const helmet = require("helmet");
const multer = require("multer"); // needed for multer error handler
const pool = require("./db"); // needed for shutdown()
const fsPromises = fs.promises;

// ===== Route Modules =====
const authRoutes = require("./routes/auth");
const commentRoutes = require("./routes/comments");
const coursesRoutes = require("./routes/courses");
const notesRoutes = require("./routes/notes");
const qaRoutes = require("./routes/qa");
const ratingsRoutes = require("./routes/ratings");
const subjectsRoutes = require("./routes/subjects");
const authMiddleware = require("./middleware/auth");

// ===== JWT SECRET HANDLING =====
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

// ===== Parse JSON body (You forgot this!) =====
app.use(express.json());

// ===== CORS =====
const allowedOrigin = process.env.CORS_ORIGIN || "http://localhost:3000";
app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ===== Security Headers =====
app.use(helmet());

// ===== Ensure uploads folder exists =====
const uploadsDir = path.join(__dirname, "uploads");

try {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Uploads directory ready:", uploadsDir);
} catch (err) {
  console.error("❌ Failed to create uploads directory:", err);
  process.exit(1);
}

// ===== Static file serving =====
app.use("/uploads", express.static(uploadsDir));

// ================= ROUTES MOUNTING ==================
app.use("/auth", authRoutes);
app.use("/courses", coursesRoutes);
app.use("/subjects", subjectsRoutes);
app.use("/qa", qaRoutes);
app.use("/users", require("./routes/users"));

// NOTES + NESTED FEATURES
app.use("/notes", notesRoutes);
app.use("/notes", ratingsRoutes);
app.use("/notes", commentRoutes);

// EXPERIENCE & SURVIVAL — NOW MOUNTED! 
const experienceRoutes = require("./routes/experience");
const survivalRoutes = require("./routes/survival");
app.use("/experience", experienceRoutes);
app.use("/survival", survivalRoutes);
const qaAnswersRoutes = require("./routes/qa-answers");
app.use("/qa", qaAnswersRoutes); 
// =====================================================
// ================ START SERVER =======================
// =====================================================
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// =====================================================
// ================ GLOBAL ERROR HANDLERS ==============
// =====================================================

// Handle multer upload errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message });
  }
  if (err.message && (err.message.includes("Only PDF") || err.message.includes("allowed"))) {
    return res.status(400).json({ error: err.message });
  }

  next(err);
});

// Last fallback error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// =====================================================
// ================ GRACEFUL SHUTDOWN ==================
// =====================================================
function shutdown() {
  console.log("Shutting down gracefully...");
  server.close(async () => {
    try {
      await pool.end();
      console.log("Database pool closed.");
      process.exit(0);
    } catch (err) {
      console.error("Error closing pool:", err);
      process.exit(1);
    }
  });

  // Force exit after 10s if stuck
  setTimeout(() => process.exit(1), 10000).unref();
}

// OS signal handlers
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

// Catch unhandled errors
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  shutdown();
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  shutdown();
});
