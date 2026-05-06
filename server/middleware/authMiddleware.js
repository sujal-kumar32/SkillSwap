const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return { token: null };
  }

  if (!authHeader.startsWith("Bearer ")) {
    return { error: "Invalid token format" };
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return { error: "Token missing" };
  }

  return { token };
};

const protect = (req, res, next) => {
  try {
    const { token, error } = getBearerToken(req);

    if (error) {
      return res.status(401).json({
        success: false,
        message: error,
      });
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const decoded = jwt.verify(token, SECRET);

    req.user = decoded;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

protect.optional = (req, res, next) => {
  try {
    const { token, error } = getBearerToken(req);

    if (error) {
      return res.status(401).json({
        success: false,
        message: error,
      });
    }

    if (token) {
      req.user = jwt.verify(token, SECRET);
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = protect;
