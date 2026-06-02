const { Op, fn, col, where, Sequelize } = require('sequelize');
const { response } = require('../helpers/response.formatter');
const { Book, Loan, Return, User } = require('../models');

module.exports = {
  // GET /reports/dashboard - Statistik dashboard
  dashboard: async (req, res) => {
    try {
      // Hanya admin yang bisa akses (cek di middleware)
      
      const [
        totalBooks,
        availableBooks,
        totalUsers,
        activeLoans,
        returnedLoans,
        overdueLoans,
        monthlyStats
      ] = await Promise.all([
        Book.count(),
        Book.count({ where: { stock: { [Op.gt]: 0 } } }),
        User.count({ where: { role: 'user' } }),
        Loan.count({ where: { status: 'dipinjam' } }),
        Loan.count({ where: { status: 'dikembalikan' } }),
        (() => {
          const overdueThreshold = new Date();
          overdueThreshold.setDate(overdueThreshold.getDate() - 14);
          return Loan.count({
            where: {
              status: 'dipinjam',
              loan_date: { [Op.lt]: overdueThreshold },
            },
          });
        })(),
        Loan.findAll({
          attributes: [
            [Sequelize.fn('DATE_FORMAT', Sequelize.col('loan_date'), '%Y-%m-01'), 'month'],
            [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
          ],
          where: {
            loan_date: { [Op.gte]: new Date(new Date().setMonth(new Date().getMonth() - 6)) },
          },
          group: [Sequelize.fn('DATE_FORMAT', Sequelize.col('loan_date'), '%Y-%m-01')],
          order: [[Sequelize.fn('DATE_FORMAT', Sequelize.col('loan_date'), '%Y-%m-01'), 'ASC']],
          raw: true,
        }),
      ]);

      return res.status(200).json(response(200, 'Dashboard stats', {
        summary: {
          total_books: totalBooks,
          available_books: availableBooks,
          total_users: totalUsers,
          active_loans: activeLoans,
          returned_loans: returnedLoans,
          overdue_loans: overdueLoans,
        },
        monthly_borrow_stats: monthlyStats,
        generated_at: new Date(),
      }));
    } catch (error) {
      console.error('Dashboard error:', error);
      return res.status(500).json(response(500, 'Terjadi kesalahan server'));
    }
  },

  // GET /reports/loans - Laporan peminjaman (filterable)
  loanReport: async (req, res) => {
    try {
      const { start_date, end_date, status, user_id } = req.query;
      const where = {};

      if (start_date || end_date) {
        where.loan_date = {};
        if (start_date) where.loan_date[Op.gte] = new Date(start_date);
        if (end_date) where.loan_date[Op.lte] = new Date(end_date);
      }
      if (status) where.status = status;
      if (user_id) where.user_id = user_id;

      const loans = await Loan.findAll({
        where,
        include: [
          { model: User, as: 'user', attributes: ['id', 'name', 'username'] },
          { model: Book, as: 'book', attributes: ['id', 'title', 'isbn', 'author'] },
          { model: Return, as: 'return' }
        ],
        order: [['loan_date', 'DESC']],
      });

      return res.status(200).json(response(200, 'Loan report', {
        data: loans,
        total: loans.length,
        filters: { start_date, end_date, status, user_id },
      }));
    } catch (error) {
      console.error('Loan report error:', error);
      return res.status(500).json(response(500, 'Terjadi kesalahan server'));
    }
  },

  // GET /reports/popular-books - Buku paling banyak dipinjam
  popularBooks: async (req, res) => {
    try {
      const { limit = 10 } = req.query;

      const popular = await Loan.findAll({
        attributes: [
          'book_id',
          [Sequelize.fn('COUNT', Sequelize.col('Loan.id')), 'borrow_count']
        ],
        include: [{ model: Book, as: 'book', attributes: ['id', 'title', 'author', 'cover_image'] }],
        group: ['Loan.book_id', 'book.id'],
        order: [[Sequelize.fn('COUNT', Sequelize.col('Loan.id')), 'DESC']],
        limit: parseInt(limit),
        raw: true,
        nest: true,
      });

      return res.status(200).json(response(200, 'Popular books', popular));
    } catch (error) {
      console.error('Popular books error:', error);
      return res.status(500).json(response(500, 'Terjadi kesalahan server'));
    }
  },
};