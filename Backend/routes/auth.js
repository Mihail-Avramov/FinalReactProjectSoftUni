const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../utils/validation');
const { optionalImageUpload } = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// Public routes - profile picture is optional during registration
router.post('/register', optionalImageUpload, registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

// Protected routes
router.post('/logout', protect, authController.logout);
router.get('/verify-token', protect, authController.verifyToken);

module.exports = router;