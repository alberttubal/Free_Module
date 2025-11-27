require("dotenv").config();
const { Pool } = require("pg");

const isProd = process.env.NODE_ENV === "production";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === "true"
    ? { rejectUnauthorized: isProd } // enforce cert validation in prod
    : false,
});

// Test initial connection
pool.connect()
  .then(client => {
    console.log("✅ Connected to PostgreSQL");
    client.release();
  })
  .catch(err => {
    console.error("❌ Database connection error:", err.message);
    if (isProd) {
      process.exit(1); // fatal in production
    }
  });

module.exports = pool;
