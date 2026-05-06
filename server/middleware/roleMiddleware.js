const hasRole = (req, role) => {
  return Array.isArray(req.user?.roles) && req.user.roles.includes(role);
};

const requireAuthUser = (req, res) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });
    return false;
  }

  return true;
};

exports.requireAdmin = (req, res, next) => {
  if (!requireAuthUser(req, res)) return;

  if (!hasRole(req, "admin")) {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

exports.requireRoles = (...roles) => {
  return (req, res, next) => {
    if (!requireAuthUser(req, res)) return;

    if (!roles.some((role) => hasRole(req, role))) {
      return res.status(403).json({
        success: false,
        message: "Insufficient role permissions",
      });
    }

    next();
  };
};

exports.requireMentor = (req, res, next) => {
  if (!requireAuthUser(req, res)) return;

  if (!hasRole(req, "mentor")) {
    return res.status(403).json({
      success: false,
      message: "Mentor access required",
    });
  }
  next();
};

exports.requireVerifiedMentor = (req, res, next) => {
  if (!requireAuthUser(req, res)) return;

  if (!req.user.isVerifiedMentor) {
    return res.status(403).json({
      success: false,
      message: "Only verified mentors allowed",
    });
  }
  next();
};

exports.requireMentorOrAdmin = (req, res, next) => {
  if (!requireAuthUser(req, res)) return;

  if (!hasRole(req, "mentor") && !hasRole(req, "admin")) {
    return res.status(403).json({
      success: false,
      message: "Mentor or admin access required",
    });
  }

  next();
};

exports.requireVerifiedMentorOrAdmin = (req, res, next) => {
  if (!requireAuthUser(req, res)) return;

  if (!req.user.isVerifiedMentor && !hasRole(req, "admin")) {
    return res.status(403).json({
      success: false,
      message: "Verified mentor or admin access required",
    });
  }

  next();
};
