const jwt = require('jsonwebtoken');
const { response } = require('../helpers/response.formatter');
const { User } = require('../models');
const { auth_secret, jwt_expire } = require('../config/base.config');

module.exports = {
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Validasi input
      if (!email || !password) {
        return res.status(400).json(response(400, 'Email dan password wajib diisi'));
      }

      // Cari user
      const user = await User.findOne({ 
        where: { email, is_active: true },
        attributes: ['id', 'name', 'email', 'role', 'password']
      });

      if (!user) {
        return res.status(401).json(response(401, 'Email atau password salah'));
      }

      // Verifikasi password
      if (!user.verifyPassword(password)) {
        return res.status(401).json(response(401, 'Email atau password salah'));
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, role: user.role },
        auth_secret,
        { expiresIn: jwt_expire }
      );

      // Response tanpa password
      const userData = user.toJSON();
      delete userData.password;

      return res.status(200).json(response(200, 'Login berhasil', {
        user: userData,
        token,
        token_type: 'Bearer',
        expires_in: jwt_expire,
      }));
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json(response(500, 'Terjadi kesalahan server'));
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.userId, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json(response(404, 'User tidak ditemukan'));
      }

      return res.status(200).json(response(200, 'Profile retrieved', user));
    } catch (error) {
      console.error('Get profile error:', error);
      return res.status(500).json(response(500, 'Terjadi kesalahan server'));
    }
  },
};