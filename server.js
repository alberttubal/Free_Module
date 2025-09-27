const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

const app = express();
const PORT = 4000;

//JWT secret
const SECRET = process.env.JWT_SECRET || 'dev_secret';

// Connect to Postgres
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "free_module",
  password: "AcadFreedom123!", // change to your actual password
  port: 5432,
  // DATABASE CONNECTION
  connectionString: process.env.postgres//postgres:AcadFreedom123!@localhost:5432/free_module,
});



pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch(err => console.error("❌ Database connection error", err));

app.use(express.json());
app.use(express.static("public"));

// ---------------- AUTH ----------------
app.post("/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!email.endsWith("@school.edu")) {
    return res.status(400).json({ error: "Must use school email" });
  }

  const hash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email",
      [name, email, hash]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating user");
  }
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: "User not found" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error logging in");
  }
});

// ---------------- NOTES ----------------
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

app.post("/notes/upload", upload.single("file"), async (req, res) => {
  const { user_id, subject_id, title, description } = req.body;
  const file_url = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const result = await pool.query(
      "INSERT INTO notes (user_id, subject_id, title, description, file_url) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [user_id, subject_id, title, description, file_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error uploading note");
  }
});

app.get("/notes", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM notes ORDER BY upload_date DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching notes");
  }
});

// ---------------- COMMENTS ----------------
app.post("/notes/:id/comments", async (req, res) => {
  const { id } = req.params;
  const { user_id, comment_text } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO comments (note_id, user_id, comment_text) VALUES ($1, $2, $3) RETURNING *",
      [id, user_id, comment_text]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding comment");
  }
});

app.get("/notes/:id/comments", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM comments WHERE note_id=$1 ORDER BY created_at DESC", [id]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching comments");
  }
});

// ---------------- RATINGS ----------------
app.post("/notes/:id/rate", async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO ratings (note_id, user_id) VALUES ($1,$2) ON CONFLICT (note_id,user_id) DO NOTHING RETURNING *",
      [id, user_id]
    );
    res.json(result.rows[0] || { message: "Already liked" });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error rating note");
  }
});

app.get("/notes/:id/ratings", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT COUNT(*) FROM ratings WHERE note_id=$1", [id]);
    res.json({ likes: result.rows[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching ratings");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
