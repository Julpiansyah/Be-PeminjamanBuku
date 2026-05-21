const { response } = require('../helpers/response.formatter');

module.exports = {
  // Cek admin only
  isAdmin: (req, res, next) => {
    if (req.userRole !== 'admin') {
      return res.status(403).json(response(403, 'Forbidden - Akses khusus admin'));
    }
    next();
  },

  // Cek peminjam atau admin
  isBorrower: (req, res, next) => {
    if (req.userRole !== 'peminjam' && req.userRole !== 'admin') {
      return res.status(403).json(response(403, 'Forbidden - Akses khusus peminjam'));
    }
    next();
  },

  // Flexible: cek multiple roles
  allowRoles: (...roles) => {
    return (req, res, next) => {
      if (!roles.includes(req.userRole)) {
        return res.status(403).json(response(403, `Forbidden - Role tidak diizinkan`));
      }
      next();
    };
  },
};