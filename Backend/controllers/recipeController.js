const recipeService = require('../services/recipeService');

/**
 * RecipeController - Handles HTTP requests for recipes
 */
const recipeController = {
  /**
   * Get all recipes with filtering and pagination
   */
  async getRecipes(req, res, next) {
    try {
      // Extract filter parameters from query string
      const filters = {
        category: req.query.category,
        difficulty: req.query.difficulty,
        search: req.query.search,
        minPreparationTime: req.query.minTime,
        maxPreparationTime: req.query.maxTime,
        author: req.query.author
      };
      
      // Extract pagination parameters
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sort: req.query.sort || '-createdAt'
      };
      
      // Get recipes from service
      const result = await recipeService.getRecipes(filters, pagination);
      
      res.status(200).json({
        success: true,
        data: result.recipes,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get recipe by ID
   */
  async getRecipeById(req, res, next) {
    try {
      const { id } = req.params;
      const includeComments = req.query.comments !== 'false';
      
      const recipe = await recipeService.getRecipeById(id, includeComments);
      
      // Check if user has favorited this recipe
      let isFavorite = false;
      if (req.user) {
        isFavorite = req.user.favoriteRecipes?.includes(id);
      }
      
      // Check if user has liked this recipe
      let isLiked = false;
      if (req.user) {
        isLiked = recipe.likes.some(like => like.toString() === req.user._id.toString());
      }
      
      // Format response
      const response = {
        ...recipe.toObject(), // Convert mongoose document to plain object
        isLiked,
        isFavorite
      };
      
      res.status(200).json({
        success: true,
        data: response
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Create a new recipe
   */
  async createRecipe(req, res, next) {
    try {
      const recipeData = req.body;
      
      if (typeof recipeData.ingredients === 'string') {
        recipeData.ingredients = JSON.parse(recipeData.ingredients);
      }
      
      if (typeof recipeData.instructions === 'string') {
        recipeData.instructions = JSON.parse(recipeData.instructions);
      }
      
      recipeData.imageFiles = req.files;
      
      const recipe = await recipeService.createRecipe(recipeData, req.user._id);
      
      res.status(201).json({
        success: true,
        data: recipe
      });
    } catch (error) {
      next(error);
    }
  },
    
  /**
   * Update a recipe
   */
  async updateRecipe(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      if (typeof updateData.ingredients === 'string') {
        updateData.ingredients = JSON.parse(updateData.ingredients);
      }
      
      if (typeof updateData.instructions === 'string') {
        updateData.instructions = JSON.parse(updateData.instructions);
      }
      
      if (typeof updateData.removedImages === 'string') {
        updateData.removedImages = JSON.parse(updateData.removedImages);
      }
      
      updateData.imageFiles = req.files;
      
      const recipe = await recipeService.updateRecipe(id, updateData, req.recipe);
      
      res.status(200).json({
        success: true,
        data: recipe
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Delete a recipe
   */
  async deleteRecipe(req, res, next) {
    try {
      const { id } = req.params;
      
      // Delete recipe
      await recipeService.deleteRecipe(id, req.recipe);
      
      res.status(200).json({
        success: true,
        message: 'Recipe deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Toggle like status for a recipe
   */
  async toggleLike(req, res, next) {
    try {
      const { id } = req.params;
      const result = await recipeService.toggleLike(id, req.user._id);
      
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Toggle favorite status for a recipe
   */
  async toggleFavorite(req, res, next) {
    try {
      const { id } = req.params;
      const isFavorite = await recipeService.toggleFavorite(id, req.user._id);
      
      res.status(200).json({
        success: true,
        data: {
          isFavorite
        }
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get user's recipes
   */
  async getUserRecipes(req, res, next) {
    try {
      const userId = req.params.userId || req.user._id;
      
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        sort: req.query.sort || '-createdAt'
      };
      
      const result = await recipeService.getUserRecipes(userId, pagination);
      
      res.status(200).json({
        success: true,
        data: result.recipes,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get user's favorite recipes
   */
  async getFavoriteRecipes(req, res, next) {
    try {
      const userId = req.user._id;
      
      const pagination = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10
      };
      
      const result = await recipeService.getFavoriteRecipes(userId, pagination);
      
      res.status(200).json({
        success: true,
        data: result.recipes,
        pagination: result.pagination
      });
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Get trending recipes
   */
  async getTrendingRecipes(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const recipes = await recipeService.getTrendingRecipes(limit);
      
      res.status(200).json({
        success: true,
        data: recipes
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = recipeController;