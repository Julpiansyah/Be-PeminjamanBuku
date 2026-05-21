const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth');
const { validate } = require('../middlewares/validator');

// Validation schema
const loginSchema = {
  email: { type: 'email', empty: false },
  password: { type: 'string', min: 6, empty: false },
};

router.post('/login', validate(loginSchema), authController.login);
router.get('/me', verifyToken, authController.getProfile);

module.exports = router;