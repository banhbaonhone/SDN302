const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header is missing" });
  }

  const parts = authHeader.trim().split(/\s+/);
  if (parts.length < 2 || parts[0].toLowerCase() !== "bearer") {
    return res.status(401).json({
      message: "Invalid token format. Format must be Bearer <token>",
    });
  }

  // Strip leading and trailing quotes if user pasted with quotes
  let token = parts.slice(1).join(" ").trim();
  token = token.replace(/^['"]+|['"]+$/g, "").trim();

  jwt.verify(token, process.env.JWT_SECRET || "HE194418", (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    req.user = decoded;
    req.userId = decoded.studentId || decoded.userId;
    next();
  });
};

module.exports = verifyToken;
