const express = require('express');
const router = express.Router();
const { register, login, loginMfa, setupMfa, confirmMfa } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/login/mfa', loginMfa);
router.post('/mfa/setup', authenticate, setupMfa);
router.post('/mfa/confirm', authenticate, confirmMfa);

module.exports = router;