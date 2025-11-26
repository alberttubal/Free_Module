require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

pool.connect()
  .then(client => {
    console.log("✅ Connected to PostgreSQL");
    client.release(); // important!
  })
  .catch(err => console.error("❌ Database connection error", err));

  
module.exports = pool;