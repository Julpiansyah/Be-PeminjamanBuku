const jwt = require('jsonwebtoken');
const { response } = require('../helpers/response.formatter');
const { auth_secret } = require('../config/base.config');

module.exports = {
  verifyToken: async (req, res, next) => {
    let token = req.header('Authorization');
    
    if (!token) {
      return res.status(401).json(response(401, 'Unauthorized - Token tidak ditemukan'));
    }

    try {
      // Handle Bearer token
      if (token.startsWith('Bearer ')) {
        token = token.slice(7);
      }

      const decoded = jwt.verify(token, auth_secret);
      req.userId = decoded.userId;
      req.userRole = decoded.role;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json(response(401, 'Unauthorized - Token telah kedaluwarsa'));
      }
      return res.status(401).json(response(401, 'Unauthorized - Token tidak valid'));
    }
  },
};