const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const { verifyToken } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/role');
const { validateQuery } = require('../middlewares/validator');

const querySchema = {
  start_date: { type: 'date', optional: true },
  end_date: { type: 'date', optional: true },
  status: { type: 'enum', values: ['dipinjam', 'dikembalikan', 'terlambat'], optional: true },
  user_id: { type: 'number', optional: true, integer: true },
  limit: { type: 'number', optional: true, integer: true, min: 1, max: 100 },
};

// Admin only routes
router.use(verifyToken, isAdmin);

router.get('/dashboard', reportController.dashboard);
router.get('/loans', validateQuery(querySchema), reportController.loanReport);
router.get('/popular-books', validateQuery(querySchema), reportController.popularBooks);

module.exports = router;