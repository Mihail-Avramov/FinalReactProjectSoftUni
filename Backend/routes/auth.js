const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { 
  registerValidation, 
  loginValidation, 
  forgotPasswordValidation, 
  resetPasswordValidation,
  emailValidation
} = require('../utils/validation');
const { optionalImageUpload } = require('../middleware/upload');
const { protect } = require('../middleware/auth');

// Public routes
router.post('/register', optionalImageUpload, registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
router.post('/resend-verification', emailValidation, authController.resendVerification);
router.post('/forgot-password', forgotPasswordValidation, authController.forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, authController.resetPassword);

// Protected routes
router.post('/logout', protect, authController.logout);
router.get('/verify-token', protect, authController.verifyToken);

module.exports = router;