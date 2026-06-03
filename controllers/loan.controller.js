const { Op } = require('sequelize');
const { response, paginate } = require('../helpers/response.formatter');
const { Loan, Book, User } = require('../models');
const Validator = require('fastest-validator');
const v = new Validator();

const LOAN_ATTRIBUTES = [
  'id', 'book_id', 'user_id', 'total_book',
  'loan_date', 'due_date', 'return_date', 'status', 'notes',
  'created_at', 'updated_at'
];

module.exports = {
  // GET /loans
  index: async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;
      const where = {};

      if (status) where.status = status;

      // Data isolation for user
      if (req.user.role === 'user') {
        where.user_id = req.user.id;
      }

      const offset = (page - 1) * limit;

      const { count, rows } = await Loan.findAndCountAll({
        attributes: LOAN_ATTRIBUTES,
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['loan_date', 'DESC']],
        include: [
          { model: Book, as: 'book', attributes: ['title', 'author'] },
          { model: User, as: 'user', attributes: ['id', 'name', 'rombel', 'rayon', 'role'] }
        ]
      });

      return res.status(200).json(response(200, 'Loans retrieved', paginate(rows, page, limit, count)));
    } catch (error) {
      console.error('Get loans error:', error);
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  },

  // GET /loans/:id
  show: async (req, res) => {
    try {
      const loan = await Loan.findByPk(req.params.id, {
        attributes: LOAN_ATTRIBUTES,
        include: [
          { model: Book, as: 'book' },
          { model: User, as: 'user', attributes: ['id', 'name', 'rombel', 'rayon', 'role'] }
        ]
      });
      if (!loan) return res.status(404).json(response(404, 'Loan not found'));

      if (req.user.role === 'user' && loan.user_id !== req.user.id) {
        return res.status(403).json(response(403, 'Forbidden - Anda hanya dapat melihat peminjaman milik sendiri'));
      }

      return res.status(200).json(response(200, 'Loan retrieved', loan));
    } catch (error) {
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  },

  // POST /loans
  store: async (req, res) => {
    try {
      req.body.user_id = req.user.id;

      const schema = {
        book_id: 'number|convert:true',
        total_book: 'number|convert:true|optional|min:1',
        due_date: 'date|convert:true',
        loan_date: 'date|convert:true|optional',
        notes: 'string|optional',
        status: { type: 'enum', values: ['dipinjam', 'dikembalikan', 'terlambat'], optional: true }
      };

      const validate = v.validate(req.body, schema);
      if (validate.length) {
        return res.status(400).json(response(400, 'Validation failed', validate));
      }

      const jumlahDipinjam = Number(req.body.total_book) || 1;

      const book = await Book.findByPk(req.body.book_id);
      if (!book) {
        return res.status(404).json(response(404, 'Buku tidak ditemukan'));
      }

      if (book.stock < jumlahDipinjam) {
        return res.status(400).json(response(400, `Stok buku tidak cukup. Stok: ${book.stock}, Diminta: ${jumlahDipinjam}`));
      }

      const loan = await Loan.create({
        book_id: req.body.book_id,
        user_id: req.body.user_id,
        total_book: jumlahDipinjam,
        loan_date: req.body.loan_date || new Date(),
        due_date: req.body.due_date,
        notes: req.body.notes || null,
        status: req.body.status || 'dipinjam'
      });

      await book.update({ stock: book.stock - jumlahDipinjam });

      return res.status(201).json(response(201, 'Peminjaman berhasil dibuat', loan));
    } catch (error) {
      console.error('Create loan error:', error);
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  },

  // PUT /loans/:id
  update: async (req, res) => {
    try {
      const loan = await Loan.findByPk(req.params.id);
      if (!loan) return res.status(404).json(response(404, 'Loan not found'));

      const schema = {
        book_id: 'number|convert:true|optional',
        user_id: 'number|convert:true|optional',
        loan_date: 'date|convert:true|optional',
        return_date: 'date|convert:true|optional',
        status: { type: 'enum', values: ['dipinjam', 'dikembalikan', 'terlambat'], optional: true }
      };

      const validate = v.validate(req.body, schema);
      if (validate.length) {
        return res.status(400).json(response(400, 'Validation failed', validate));
      }

      const previousStatus = loan.status;

      await loan.update(req.body);

      if (req.body.status === 'dikembalikan' && previousStatus !== 'dikembalikan') {
        const book = await Book.findByPk(loan.book_id);
        if (book) {
          await book.increment('stock', { by: loan.total_book || 1 });
        }
        if (!loan.return_date && !req.body.return_date) {
          await loan.update({ return_date: new Date() });
        }
      }

      await loan.reload({ attributes: LOAN_ATTRIBUTES });

      return res.status(200).json(response(200, 'Loan updated successfully', loan));
    } catch (error) {
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  },

  // DELETE /loans/:id
  destroy: async (req, res) => {
    try {
      const loan = await Loan.findByPk(req.params.id);
      if (!loan) return res.status(404).json(response(404, 'Loan not found'));

      await loan.destroy();
      return res.status(200).json(response(200, 'Loan deleted successfully'));
    } catch (error) {
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  }
};