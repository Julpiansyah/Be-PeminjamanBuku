const { response } = require('../helpers/response.formatter');

const role = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(response(401, 'Unauthorized'));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(response(403, 'Forbidden - Akses ditolak untuk role ini'));
    }

    next();
  };
};

// Alias untuk route yang membutuhkan admin saja (mis. reports)
role.isAdmin = role('admin');

module.exports = role;