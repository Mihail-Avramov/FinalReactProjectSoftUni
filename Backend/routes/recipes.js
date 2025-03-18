const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { protect, optionalAuth,isRecipeOwner } = require('../middleware/auth');
const { uploadMultipleImages, handleMulterErrors } = require('../middleware/upload');
const { recipeValidation, idParamValidation } = require('../utils/validation');


router.get('/', recipeController.getRecipes);
router.get('/trending', recipeController.getTrendingRecipes);

// User-specific recipe routes
router.get('/users/', protect, recipeController.getUserRecipes); // Current user's recipes
router.get('/users/favorites', protect, recipeController.getFavoriteRecipes); // Current user's favorites
router.get('/users/:id', idParamValidation, optionalAuth, recipeController.getUserRecipes); // Specific user's recipes


router.get('/:id', idParamValidation, optionalAuth, recipeController.getRecipeById); // Specific recipe


router.use(protect);

router.post(
  '/',
  uploadMultipleImages,
  handleMulterErrors,
  recipeValidation,
  recipeController.createRecipe
);

router.put(
  '/:id',
  idParamValidation,
  isRecipeOwner,
  uploadMultipleImages,
  handleMulterErrors,
  recipeController.updateRecipe
);

router.delete('/:id', idParamValidation, isRecipeOwner, recipeController.deleteRecipe);

// Social interaction routes
router.post('/:id/like', idParamValidation, recipeController.toggleLike);
router.post('/:id/favorite', idParamValidation, recipeController.toggleFavorite);

module.exports = router;