const { Op } = require('sequelize');
const { response, paginate } = require('../helpers/response.formatter');
const { Return, Loan, Book } = require('../models');
const Validator = require('fastest-validator');
const v = new Validator();

module.exports = {
  // GET /returns
  index: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const loanWhere = {};
      if (req.user.role === 'user') {
        loanWhere.user_id = req.user.id;
      }

      const { count, rows } = await Return.findAndCountAll({
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['return_date', 'DESC']],
        include: [
          { 
            model: Loan, 
            as: 'loan', 
            where: loanWhere,
            include: [{ model: Book, as: 'book', attributes: ['title'] }] 
          }
        ]
      });

      return res.status(200).json(response(200, 'Returns retrieved', paginate(rows, page, limit, count)));
    } catch (error) {
      console.error('Get returns error:', error);
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  },

  // GET /returns/:id
  show: async (req, res) => {
    try {
      const returned = await Return.findByPk(req.params.id, {
        include: [
          { model: Loan, as: 'loan', include: [{ model: Book, as: 'book' }] }
        ]
      });
      if (!returned) return res.status(404).json(response(404, 'Return not found'));

      if (req.user.role === 'user' && returned.loan && returned.loan.user_id !== req.user.id) {
        return res.status(403).json(response(403, 'Forbidden - Anda hanya dapat melihat pengembalian milik sendiri'));
      }

      return res.status(200).json(response(200, 'Return retrieved', returned));
    } catch (error) {
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  },

  // POST /returns
  store: async (req, res) => {
    try {
      const schema = {
        loan_id: "number|convert:true",
        return_date: "date|convert:true|optional",
        notes: "string|optional"
      };

      const validate = v.validate(req.body, schema);
      if (validate.length) {
        return res.status(400).json(response(400, 'Validation failed', validate));
      }

      // Check if loan exists
      const loan = await Loan.findByPk(req.body.loan_id);
      if (!loan) {
        return res.status(404).json(response(404, 'Loan not found'));
      }
      
      if (loan.status === 'dikembalikan') {
        return res.status(400).json(response(400, 'Loan already returned'));
      }

      if (req.user.role === 'user' && loan.user_id !== req.user.id) {
        return res.status(403).json(response(403, 'Forbidden - Anda hanya dapat mengembalikan buku milik sendiri'));
      }

      const existingReturn = await Return.findOne({ where: { loan_id: loan.id } });
      if (existingReturn) {
        return res.status(400).json(response(400, 'Pengembalian untuk peminjaman ini sudah tercatat'));
      }

      // Create return record
      const returned = await Return.create({
        loan_id: req.body.loan_id,
        return_date: req.body.return_date || new Date(),
        notes: req.body.notes || null
      });

      // Update loan status
      await loan.update({ status: 'dikembalikan', return_date: returned.return_date });

      // Update book stock
      const book = await Book.findByPk(loan.book_id);
      if (book) {
        await book.update({
          stock: book.stock + (loan.total_book || 1)
        });
      }

      return res.status(201).json(response(201, 'Return created successfully', returned));
    } catch (error) {
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  },

  // PUT /returns/:id
  update: async (req, res) => {
    try {
      const returned = await Return.findByPk(req.params.id);
      if (!returned) return res.status(404).json(response(404, 'Return not found'));

      const schema = {
        loan_id: "number|convert:true|optional",
        return_date: "date|convert:true|optional",
        notes: "string|optional"
      };

      const validate = v.validate(req.body, schema);
      if (validate.length) {
        return res.status(400).json(response(400, 'Validation failed', validate));
      }

      await returned.update(req.body);
      return res.status(200).json(response(200, 'Return updated successfully', returned));
    } catch (error) {
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  },

  // DELETE /returns/:id
  destroy: async (req, res) => {
    try {
      const returned = await Return.findByPk(req.params.id);
      if (!returned) return res.status(404).json(response(404, 'Return not found'));

      await returned.destroy();
      return res.status(200).json(response(200, 'Return deleted successfully'));
    } catch (error) {
      return res.status(500).json(response(500, 'Internal server error', error.message));
    }
  }
};
