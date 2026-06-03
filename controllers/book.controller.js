const { Op } = require('sequelize');
const { response, paginate } = require('../helpers/response.formatter');
const { Book, Loan } = require('../models');
const path = require('path');
const Validator = require('fastest-validator');
const v = new Validator();

module.exports = {
  // GET /books
  index: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        category,
        sort = 'created_at',
        order = 'DESC'
      } = req.query;

      const where = {};
      
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { author: { [Op.like]: `%${search}%` } },
          { publisher: { [Op.like]: `%${search}%` } },
          { isbn: { [Op.like]: `%${search}%` } },
        ];
      }
      if (category) where.category = category;

      const orderClause = [[sort, order.toUpperCase()]];
      const offset = (page - 1) * limit;

      const { count, rows } = await Book.findAndCountAll({
        where,
        order: orderClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return res.status(200).json(response(200, 'Books retrieved', paginate(rows, page, limit, count)));
    } catch (error) {
      console.error('Get books error:', error);
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  },

  // GET /books/:id
  show: async (req, res) => {
    try {
      const book = await Book.findByPk(req.params.id);
      if (!book) return res.status(404).json(response(404, 'Book not found'));
      return res.status(200).json(response(200, 'Book retrieved', book));
    } catch (error) {
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  },

  // POST /books
  store: async (req, res) => {
    try {
      const schema = {
        title: "string|empty:false",
        author: "string|empty:false",
        isbn: "string|optional",
        publisher: "string|optional",
        year: "string|convert:true|optional", // convert string to number if multipart form-data
        category: "string|optional",
        description: "string|optional",
        stock: "string|convert:true|optional"
      };

      const validate = v.validate(req.body, schema);
      if (validate.length) {
        return res.status(400).json(response(400, 'Validation failed', validate));
      }

      const cover_url = req.file ? `/uploads/books/${req.file.filename}` : null;

      const book = await Book.create({
        title: req.body.title,
        author: req.body.author,
        isbn: req.body.isbn,
        publisher: req.body.publisher,
        year: req.body.year ? parseInt(req.body.year) : null,
        category: req.body.category,
        description: req.body.description,
        stock: req.body.stock ? parseInt(req.body.stock) : 0,
        cover_url,
      });

      return res.status(201).json(response(201, 'Book created successfully', book));
    } catch (error) {
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  },

  // PUT /books/:id
  update: async (req, res) => {
    try {
      const book = await Book.findByPk(req.params.id);
      if (!book) return res.status(404).json(response(404, 'Book not found'));

      const schema = {
        title: "string|optional",
        author: "string|optional",
        isbn: "string|optional",
        publisher: "string|optional",
        year: "string|convert:true|optional",
        category: "string|optional",
        description: "string|optional",
        stock: "string|convert:true|optional"
      };

      const validate = v.validate(req.body, schema);
      if (validate.length) {
        return res.status(400).json(response(400, 'Validation failed', validate));
      }

      let cover_url = book.cover_url;
      if (req.file) {
        cover_url = `/uploads/books/${req.file.filename}`;
      }

      await book.update({
        title: req.body.title || book.title,
        author: req.body.author || book.author,
        isbn: req.body.isbn !== undefined ? req.body.isbn : book.isbn,
        publisher: req.body.publisher !== undefined ? req.body.publisher : book.publisher,
        year: req.body.year ? parseInt(req.body.year) : book.year,
        category: req.body.category !== undefined ? req.body.category : book.category,
        description: req.body.description !== undefined ? req.body.description : book.description,
        stock: req.body.stock !== undefined ? parseInt(req.body.stock) : book.stock,
        cover_url,
      });

      await book.reload();
      return res.status(200).json(response(200, 'Book updated successfully', book));
    } catch (error) {
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  },

  // DELETE /books/:id
  destroy: async (req, res) => {
    try {
      const book = await Book.findByPk(req.params.id);
      if (!book) return res.status(404).json(response(404, 'Book not found'));

      // Jika schema Loan masih memiliki status 'dipinjam'
      const activeLoan = await Loan.findOne({
        where: { book_id: book.id, status: 'dipinjam' }
      });

      if (activeLoan) {
        return res.status(400).json(response(400, 'Cannot delete book, it has active loans'));
      }
      
      await book.destroy();
      return res.status(200).json(response(200, 'Book deleted successfully'));
    } catch (error) {
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  }
};