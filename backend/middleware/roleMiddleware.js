const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const userRoleLower = req.user.role.toLowerCase();
    const allowedRolesLower = allowedRoles.map((r) => r.toLowerCase());

    if (!allowedRolesLower.includes(userRoleLower)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    next();
  };
};

module.exports = { checkRole };
