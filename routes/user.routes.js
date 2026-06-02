const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken } = require('../middlewares/auth');
const role = require('../middlewares/role');

router.use(verifyToken);

// Only admin can CRUD users
router.get('/', role('admin'), userController.index);
router.get('/:id', role('admin'), userController.show);
router.post('/', role('admin'), userController.store);
router.put('/:id', role('admin'), userController.update);
router.delete('/:id', role('admin'), userController.destroy);

module.exports = router;
