const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const { verifyToken } = require('../middlewares/auth');
const role = require('../middlewares/role');
const { upload } = require('../middlewares/upload');

// All book routes require login
router.use(verifyToken);

// Public (Logged in users & admin)
router.get('/', role('admin', 'user'), bookController.index);
router.get('/:id', role('admin', 'user'), bookController.show);

// Protected routes (Admin only)
router.post('/', role('admin'), upload.single('cover'), bookController.store);
router.put('/:id', role('admin'), upload.single('cover'), bookController.update);
router.delete('/:id', role('admin'), bookController.destroy);

module.exports = router;