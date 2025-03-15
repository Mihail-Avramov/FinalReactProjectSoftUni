const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerValidation, loginValidation } = require('../utils/validation');
const { optionalImageUpload } = require('../middleware/upload');

// Public routes - profile picture is optional during registration
router.post('/register', optionalImageUpload, registerValidation, authController.register);
router.post('/login', loginValidation, authController.login);

module.exports = router;