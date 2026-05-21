const { Op } = require('sequelize');
const { response, paginate } = require('../helpers/response.formatter');
const { Book, Loan } = require('../models');
const path = require('path');

module.exports = {
  // GET /books - List buku dengan pagination, search, sorting
  index: async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        search, 
        category, 
        author, 
        available,
        sort = 'created_at',
        order = 'DESC'
      } = req.query;

      const where = {};
      
      // Search filter
      if (search) {
        where[Op.or] = [
          { title: { [Op.iLike]: `%${search}%` } },
          { author: { [Op.iLike]: `%${search}%` } },
          { isbn: { [Op.iLike]: `%${search}%` } },
        ];
      }
      if (category) where.category = category;
      if (author) where.author = { [Op.iLike]: `%${author}%` };
      if (available !== undefined) {
        where.stock = available === 'true' ? { [Op.gt]: 0 } : { [Op.lte]: 0 };
      }

      // Sorting
      const orderClause = [[sort, order.toUpperCase()]];

      // Pagination
      const offset = (page - 1) * limit;

      const { count, rows } = await Book.findAndCountAll({
        where,
        order: orderClause,
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      return res.status(200).json(response(200, 'Books retrieved', 
        paginate(rows, page, limit, count)
      ));
    } catch (error) {
      console.error('Get books error:', error);
      return res.status(500).json(response(500, 'Terjadi kesalahan server', error.message));
    }
  },

  // GET /books/:id - Detail buku
  show: async (req, res) => {
    try {
      const book = await Book.findByPk(req.params.id);
      
      if (!book) {
        return res.status(404).json(response(404, 'Buku tidak ditemukan'));
      }

      return res.status(200).json(response(200, 'Book retrieved', book));
    } catch (error) {
      console.error('Get book error:', error);
      return res.status(500).json(response(500, 'Terjadi kesalahan server', error.message));
    }
  },

  // POST /books - Create buku (Admin only)
  store: async (req, res) => {
    try {
      const { title, author, isbn, publisher, year, category, description, stock } = req.body;

      // Validasi required fields
      if (!title || !author) {
        return res.status(400).json(response(400, 'Title dan author wajib diisi'));
      }

      // Handle upload cover
      const cover_image = req.file ? `/uploads/books/${req.file.filename}` : null;

      const book = await Book.create({
        title,
        author,
        isbn,
        publisher,
        year: year ? parseInt(year) : null,
        category,
        description,
        stock: stock ? parseInt(stock) : 0,
        cover_image,
      });

      return res.status(201).json(response(201, 'Buku berhasil ditambahkan', book));
    } catch (error) {
      console.error('Create book error:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json(response(400, 'ISBN sudah terdaftar'));
      }
      return res.status(500).json(response(500, 'Terjadi kesalahan server', error.message));
    }
  },

  // PUT /books/:id - Update buku (Admin only)
  update: async (req, res) => {
    try {
      const book = await Book.findByPk(req.params.id);
      
      if (!book) {
        return res.status(404).json(response(404, 'Buku tidak ditemukan'));
      }

      const { title, author, isbn, publisher, year, category, description, stock } = req.body;

      // Handle upload cover baru
      let cover_image = book.cover_image;
      if (req.file) {
        // TODO: Hapus file lama jika ada (implementasi opsional)
        cover_image = `/uploads/books/${req.file.filename}`;
      }

      await book.update({
        title: title || book.title,
        author: author || book.author,
        isbn: isbn !== undefined ? isbn : book.isbn,
        publisher: publisher !== undefined ? publisher : book.publisher,
        year: year ? parseInt(year) : book.year,
        category: category !== undefined ? category : book.category,
        description: description !== undefined ? description : book.description,
        stock: stock !== undefined ? parseInt(stock) : book.stock,
        cover_image,
      });

      return res.status(200).json(response(200, 'Buku berhasil diperbarui', book));
    } catch (error) {
      console.error('Update book error:', error);
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json(response(400, 'ISBN sudah terdaftar'));
      }
      return res.status(500).json(response(500, 'Terjadi kesalahan server', error.message));
    }
  },

  // DELETE /books/:id - Delete buku (Admin only)
  destroy: async (req, res) => {
    try {
      const book = await Book.findByPk(req.params.id);
      
      if (!book) {
        return res.status(404).json(response(404, 'Buku tidak ditemukan'));
      }

      // Logic: Tidak bisa hapus jika ada peminjaman aktif
      const activeLoan = await Loan.findOne({
        where: { book_id: book.id, status: 'dipinjam' }
      });

      if (activeLoan) {
        return res.status(400).json(response(400, 'Buku tidak dapat dihapus karena masih ada peminjaman aktif'));
      }

      // TODO: Hapus file cover jika ada (implementasi opsional)
      
      await book.destroy();
      return res.status(200).json(response(200, 'Buku berhasil dihapus'));
    } catch (error) {
      console.error('Delete book error:', error.message);
      return res.status(500).json(response(500, 'Terjadi kesalahan server', error.message));
    }
  },
};