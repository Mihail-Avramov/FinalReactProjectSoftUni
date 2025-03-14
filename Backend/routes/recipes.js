// In routes/recipes.js
const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { protect } = require('../middleware/auth');
const { uploadMultipleImages } = require('../middleware/upload');
const { recipeValidation } = require('../utils/validation');

// Create recipe with image upload
router.post('/', 
  protect, 
  uploadMultipleImages, 
  recipeValidation, 
  recipeController.createRecipe
);

module.exports = router;