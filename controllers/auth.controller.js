const jwt = require('jsonwebtoken');
const { response } = require('../helpers/response.formatter');
const { User } = require('../models');
const { auth_secret, jwt_expire } = require('../config/base.config');

module.exports = {
  register: async (req, res) => {
    try {
      // UBAH: Hanya ambil name dan password (sesuai database)
      const { name, password } = req.body;

      if (req.body.role && req.body.role !== 'user') {
        return res.status(403).json(response(403, 'Registrasi hanya untuk role peminjam (user)'));
      }

      // UBAH: Validasi name, bukan username
      if (!name || !password) {
        return res.status(400).json(response(400, 'Name dan password wajib diisi'));
      }

      if (password.length < 6) {
        return res.status(400).json(response(400, 'Password minimal 6 karakter'));
      }

      // UBAH: Cek ketersediaan berdasarkan name
      const existingUser = await User.findOne({ where: { name } });
      if (existingUser) {
        return res.status(400).json(response(400, 'Name sudah digunakan'));
      }

      const user = await User.create({
        name,
        password,
        role: 'user',
      });

      const userData = user.toJSON();
      delete userData.password;

      // UBAH: Payload token menggunakan 'name', bukan 'username'
      const token = jwt.sign(
        { id: user.id, name: user.name, role: user.role },
        auth_secret,
        { expiresIn: jwt_expire }
      );

      return res.status(201).json(response(201, 'Registrasi berhasil', {
        user: userData,
        token,
        token_type: 'Bearer',
        expires_in: jwt_expire,
      }));
    } catch (error) {
      console.error('Register error:', error);
      return res.status(500).json(response(500, 'Terjadi kesalahan server', error.message));
    }
  },

  login: async (req, res) => {
    try {
      // UBAH: Minta 'name', bukan 'username'
      const { name, password } = req.body;

      // Validasi input
      if (!name || !password) {
        return res.status(400).json(response(400, 'Name dan password wajib diisi'));
      }

      // UBAH: Cari user berdasarkan 'name', hapus 'username' dari attributes
      const user = await User.findOne({ 
        where: { name },
        attributes: ['id', 'name', 'role', 'password']
      });

      if (!user) {
        return res.status(401).json(response(401, 'Name atau password salah'));
      }

      // Verifikasi password
      if (!user.verifyPassword(password)) {
        return res.status(401).json(response(401, 'Name atau password salah'));
      }

      // UBAH: Payload token menggunakan 'name'
      const token = jwt.sign(
        { id: user.id, name: user.name, role: user.role },
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
      return res.status(500).json(response(500, 'Terjadi kesalahan server', error.message));
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await User.findByPk(req.user.id, {
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