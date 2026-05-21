const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');
const { verifyToken } = require('../middlewares/auth');
const { allowRoles } = require('../middlewares/role');
const { validate, validateQuery } = require('../middlewares/validator');

// Validation schemas
const borrowSchema = {
  book_id: { type: 'number', integer: true, empty: false },
  due_date: { type: 'date', optional: false, convert: true },
  total_book: { type: 'number', optional: true, integer: true, min: 1, convert: true },
};

const returnSchema = {
  loan_id: { type: 'number', integer: true, empty: false },
  total_book: { type: 'number', optional: true, integer: true, min: 1, convert: true },
  condition: { type: 'enum', values: ['baik', 'rusak_ringan', 'rusak_berat', 'hilang'], optional: true },
  fine_amount: { type: 'number', optional: true, min: 0 },
  notes: { type: 'string', optional: true },
};

const querySchema = {
  page: { type: 'number', optional: true, integer: true, min: 1, convert: true },
  limit: { type: 'number', optional: true, integer: true, min: 1, max: 100, convert: true },
  status: { type: 'enum', values: ['dipinjam', 'dikembalikan', 'terlambat'], optional: true },
  user_id: { type: 'number', optional: true, integer: true, convert: true },
  book_id: { type: 'number', optional: true, integer: true, convert: true },
};

// Routes
router.use(verifyToken);

// Borrow (User & Admin)
router.post('/borrow', validate(borrowSchema), allowRoles('peminjam', 'admin'), loanController.borrow);

// History (User)
router.get('/history', validateQuery(querySchema), loanController.history);

// Admin only
router.use(allowRoles('admin'));

// List loans (Admin)
router.get('/', validateQuery(querySchema), loanController.index);

// ✅ Return (Admin) - PASTIKAN INI ADA
router.post('/return', validate(returnSchema), loanController.returnBook);

module.exports = router;