const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: 'Authorization header missing.'
      });
    }

    const parts = authHeader.trim().split(/\s+/);
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        message: 'Invalid authorization format. Expected format: Bearer <token>'
      });
    }

    const token = parts[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          message: 'Invalid or expired token.'
        });
      }

      req.user = decoded;
      next();
    });
  } catch (error) {
    return res.status(401).json({
      message: 'Authentication failed.',
      error: error.message
    });
  }
};

module.exports = authMiddleware;
