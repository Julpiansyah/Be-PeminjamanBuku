const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { verifyToken } = require('../middlewares/auth');
const { validate } = require('../middlewares/validator');

const loginSchema = {
  name: { type: 'string', empty: false },  // ← UBAH DARI username
  password: { type: 'string', min: 6, empty: false },
};


const registerSchema = {
  name: { type: 'string', empty: false },
  password: { type: 'string', min: 6, empty: false },
};

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', verifyToken, authController.getProfile);

module.exports = router;