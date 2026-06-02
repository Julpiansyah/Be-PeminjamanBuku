const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loan.controller');
const { verifyToken } = require('../middlewares/auth');
const role = require('../middlewares/role');

router.use(verifyToken);

// GET accessible by both admin and user
router.get('/', role('admin', 'user'), loanController.index);
router.get('/:id', role('admin', 'user'), loanController.show);

// POST only accessible by user (as per requirement: "admin tidak melakukan peminjaman")
router.post('/', role('user'), loanController.store);

// PUT and DELETE (Admin only for management if needed)
router.put('/:id', role('admin'), loanController.update);
router.delete('/:id', role('admin'), loanController.destroy);

module.exports = router;