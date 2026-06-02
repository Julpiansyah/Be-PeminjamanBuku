const { Op } = require('sequelize');
const { response, paginate } = require('../helpers/response.formatter');
const { User } = require('../models');
const Validator = require('fastest-validator');
const v = new Validator();

module.exports = {
  // GET /users
  index: async (req, res) => {
    try {
      const { page = 1, limit = 10, search } = req.query;
      const where = {};
      
      if (search) {
        // HAPUS pencarian username, hanya cari di name
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } }
        ];
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await User.findAndCountAll({
        where,
        attributes: { exclude: ['password'] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      return res.status(200).json(response(200, 'Users retrieved', paginate(rows, page, limit, count)));
    } catch (error) {
      console.error('Get users error:', error);
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  },

  // GET /users/:id
  show: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] }
      });
      
      if (!user) {
        return res.status(404).json(response(404, 'User not found'));
      }

      return res.status(200).json(response(200, 'User retrieved', user));
    } catch (error) {
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  },

  // POST /users
  store: async (req, res) => {
    try {
      // HAPUS validasi username, hanya validasi name
      const schema = {
        name: "string|empty:false",
        password: "string|min:6",
        role: { type: "enum", values: ["admin", "user"], optional: true }
      };

      const validate = v.validate(req.body, schema);
      if (validate.length) {
        return res.status(400).json(response(400, 'Validation failed', validate));
      }

      // CEK duplicate berdasarkan name, bukan username
      const existingUser = await User.findOne({ where: { name: req.body.name } });
      if (existingUser) {
        return res.status(400).json(response(400, 'Name already taken'));
      }

      const user = await User.create(req.body);
      const userData = user.toJSON();
      delete userData.password;

      return res.status(201).json(response(201, 'User created successfully', userData));
    } catch (error) {
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  },

  // PUT /users/:id
  update: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json(response(404, 'User not found'));
      }

      // HAPUS validasi username
      const schema = {
        name: "string|optional",
        password: "string|min:6|optional",
        role: { type: "enum", values: ["admin", "user"], optional: true }
      };

      const validate = v.validate(req.body, schema);
      if (validate.length) {
        return res.status(400).json(response(400, 'Validation failed', validate));
      }

      // CEK duplicate name jika diubah
      if (req.body.name && req.body.name !== user.name) {
        const existingUser = await User.findOne({ where: { name: req.body.name } });
        if (existingUser) {
          return res.status(400).json(response(400, 'Name already taken'));
        }
      }

      await user.update(req.body);
      const userData = user.toJSON();
      delete userData.password;

      return res.status(200).json(response(200, 'User updated successfully', userData));
    } catch (error) {
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  },

  // DELETE /users/:id
  destroy: async (req, res) => {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json(response(404, 'User not found'));
      }

      await user.destroy();
      return res.status(200).json(response(200, 'User deleted successfully'));
    } catch (error) {
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  }
};