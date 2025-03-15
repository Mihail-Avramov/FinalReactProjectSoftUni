const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');

/**
 * @route   GET /api/config
 * @desc    Get application configuration and enum values
 * @access  Public
 */
router.get('/', configController.getAppConfig);

module.exports = router;