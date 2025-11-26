const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

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
    const decoded = jwt.verify(token, SECRET, { algorithms: ["HS256"] }); // Specify algorithm to prevent attacks

    // Validate required payload fields
    if (!decoded.id || !decoded.email) {
      return res.status(401).json({ error: "Invalid token payload" });
    }

    req.user = { id: decoded.id, email: decoded.email };
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token has expired" });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    } else {
      return res.status(401).json({ error: "Token verification failed" });
    }
  }
}

module.exports = authMiddleware;