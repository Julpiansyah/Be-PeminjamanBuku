const express = require('express');
const router = express.Router();
const bookController = require('../controllers/book.controller');
const { verifyToken } = require('../middlewares/auth');
const { isAdmin } = require('../middlewares/role');
const { upload } = require('../middlewares/upload');
const { validate, validateQuery } = require('../middlewares/validator');

// Validation schemas
const bookSchema = {
  title: { type: 'string', empty: false, max: 200 },
  author: { type: 'string', empty: false, max: 100 },
  isbn: { type: 'string', optional: true, max: 50 },
  publisher: { type: 'string', optional: true, max: 100 },
  
  year: { type: 'number', optional: true, integer: true, convert: true },
  
  category: { type: 'string', optional: true, max: 50 },
  description: { type: 'string', optional: true },
  stock: { type: 'number', optional: true, integer: true, min: 0, convert: true },
};

const querySchema = {
  page: { type: 'number', optional: true, integer: true, min: 1, convert: true },
  limit: { type: 'number', optional: true, integer: true, min: 1, max: 100, convert : true },
  search: { type: 'string', optional: true },
  category: { type: 'string', optional: true },
  author: { type: 'string', optional: true },
  available: { type: 'boolean', optional: true, convert: true },
  sort: { type: 'string', optional: true },
  order: { type: 'string', optional: true, enum: ['ASC', 'DESC'] },
};

// Public routes
router.get('/', validateQuery(querySchema), bookController.index);
router.get('/:id', bookController.show);

// Protected routes (Admin only)
router.use(verifyToken, isAdmin);
router.post('/', upload.single('cover'), validate(bookSchema), bookController.store);
router.put('/:id', upload.single('cover'), validate(bookSchema), bookController.update);
router.delete('/:id', bookController.destroy);

module.exports = router;