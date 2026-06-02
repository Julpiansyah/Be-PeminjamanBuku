const express = require('express');
const router = express.Router();
const returnController = require('../controllers/return.controller');
const { verifyToken } = require('../middlewares/auth');
const role = require('../middlewares/role');

router.use(verifyToken);

// GET accessible by both admin and user
router.get('/', role('admin', 'user'), returnController.index);
router.get('/:id', role('admin', 'user'), returnController.show);

// User mengembalikan buku miliknya sendiri
router.post('/', role('user'), returnController.store);

// Admin mengelola data pengembalian
router.put('/:id', role('admin'), returnController.update);
router.delete('/:id', role('admin'), returnController.destroy);

module.exports = router;
