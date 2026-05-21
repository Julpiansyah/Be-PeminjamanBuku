const { Op } = require('sequelize');
const { response, paginate } = require('../helpers/response.formatter');
const db = require('../models');

// GET /loans - List peminjaman (Admin only)
const index = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, user_id, book_id, search } = req.query;
    const where = {};

    if (status) where.status = status;
    if (user_id) where.user_id = user_id;
    if (book_id) where.book_id = book_id;
    
    if (search) {
      const users = await db.User.findAll({
        where: { name: { [Op.iLike]: `%${search}%` } },
        attributes: ['id']
      });
      const books = await db.Book.findAll({
        where: { title: { [Op.iLike]: `%${search}%` } },
        attributes: ['id']
      });
      where[Op.or] = [
        { user_id: users.map(u => u.id) },
        { book_id: books.map(b => b.id) }
      ];
    }

    const offset = (page - 1) * limit;
    const { count, rows } = await db.Loan.findAndCountAll({
      where,
      include: [
        { model: db.User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: db.Book, as: 'book', attributes: ['id', 'title', 'author', 'cover_image'] },
        { model: db.Return, as: 'return' }
      ],
      order: [['loan_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json(response(200, 'Loans retrieved', paginate(rows, page, limit, count)));
  } catch (error) {
    console.error('Get loans error:', error);
    return res.status(500).json(response(500, 'Terjadi kesalahan server'));
  }
};

// POST /loans/borrow - Pinjam buku
const borrow = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { book_id, due_date, total_book = 1 } = req.body;
    const user_id = req.userId;

    if (!book_id || !due_date) {
      await transaction.rollback();
      return res.status(400).json(response(400, 'Book ID dan due date wajib diisi'));
    }

    const book = await db.Book.findByPk(book_id, { transaction });
    if (!book) {
      await transaction.rollback();
      return res.status(404).json(response(404, 'Buku tidak ditemukan'));
    }

    if (book.stock < total_book) {
      await transaction.rollback();
      return res.status(400).json(response(400, `Stok tidak cukup. Tersedia: ${book.stock}`));
    }

    const existingLoan = await db.Loan.findOne({
      where: { user_id, book_id, status: 'dipinjam' },
      transaction
    });

    if (existingLoan) {
      await transaction.rollback();
      return res.status(400).json(response(400, 'Anda sudah meminjam buku ini'));
    }

    await book.decrement('stock', { by: total_book, transaction });

    const loan = await db.Loan.create({
      user_id,
      book_id,
      total_book,
      due_date: new Date(due_date),
      status: 'dipinjam',
    }, { transaction });

    await transaction.commit();

    const loanWithDetails = await db.Loan.findByPk(loan.id, {
      include: [
        { model: db.User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: db.Book, as: 'book', attributes: ['id', 'title', 'author'] }
      ]
    });

    return res.status(201).json(response(201, 'Peminjaman berhasil', loanWithDetails));
  } catch (error) {
    await transaction.rollback();
    console.error('Borrow error:', error);
    return res.status(500).json(response(500, 'Terjadi kesalahan server'));
  }
};

// POST /loans/return - Kembalikan buku (Admin)
const returnBook = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  
  try {
    const { loan_id, total_book = 1, condition = 'baik', fine_amount = 0, notes } = req.body;
    const processed_by = req.userId;

    const loan = await db.Loan.findByPk(loan_id, { 
      include: [{ model: db.Book, as: 'book' }],
      transaction 
    });
    
    if (!loan) {
      await transaction.rollback();
      return res.status(404).json(response(404, 'Peminjaman tidak ditemukan'));
    }

    if (loan.status !== 'dipinjam') {
      await transaction.rollback();
      return res.status(400).json(response(400, 'Buku sudah dikembalikan'));
    }

    const isLate = new Date() > new Date(loan.due_date);
    await loan.update({
      return_date: new Date(),
      status: isLate ? 'terlambat' : 'dikembalikan',
    }, { transaction });

    await db.Book.increment('stock', { 
      by: total_book, 
      where: { id: loan.book_id },
      transaction 
    });

    const returnRecord = await db.Return.create({
      loan_id,
      return_date: new Date(),
      condition,
      fine_amount: parseFloat(fine_amount) || 0,
      notes,
      processed_by,
    }, { transaction });

    await transaction.commit();

    return res.status(200).json(response(200, 'Pengembalian berhasil', {
      loan: await db.Loan.findByPk(loan_id, {
        include: [
          { model: db.User, as: 'user', attributes: ['id', 'name'] },
          { model: db.Book, as: 'book', attributes: ['id', 'title', 'author'] },
          { model: db.Return, as: 'return' }
        ]
      }),
      return: returnRecord,
      fine_applied: isLate ? 'Denda terlambat mungkin berlaku' : null,
    }));
  } catch (error) {
    await transaction.rollback();
    console.error('Return error:', error);
    return res.status(500).json(response(500, 'Terjadi kesalahan server'));
  }
};

// GET /loans/history - Riwayat user
const history = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await db.Loan.findAndCountAll({
      where: { user_id: req.userId },
      include: [
        { model: db.Book, as: 'book', attributes: ['id', 'title', 'author', 'cover_image'] },
        { model: db.Return, as: 'return' }
      ],
      order: [['loan_date', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json(response(200, 'History retrieved', paginate(rows, page, limit, count)));
  } catch (error) {
    console.error('History error:', error);
    return res.status(500).json(response(500, 'Terjadi kesalahan server'));
  }
};

// ✅ EXPORT - WAJIB ADA & NAMA HARUS PERSIS
module.exports = {
  index,
  borrow,
  returnBook,
  history,
};