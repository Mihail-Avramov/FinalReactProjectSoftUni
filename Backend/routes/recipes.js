const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/recipeController');
const { protect, optionalAuth,isRecipeOwner } = require('../middleware/auth');
const { uploadMultipleImages, handleMulterErrors } = require('../middleware/upload');
const { recipeValidation, idParamValidation } = require('../utils/validation');


router.get('/', recipeController.getRecipes);
router.get('/trending', recipeController.getTrendingRecipes);

// Routes with optional authentication
router.get('/:id', idParamValidation, optionalAuth, recipeController.getRecipeById);
router.get('/user/:userId', idParamValidation, recipeController.getUserRecipes);

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

// User-specific recipe routes
router.get('/user/me', recipeController.getUserRecipes); // Current user's recipes
router.get('/favorites', recipeController.getFavoriteRecipes); // Current user's favorites

module.exports = router;