const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { AppError } = require('../middleware/errorHandler');
const cloudinary = require('../config/cloudinary');

/**
 * Recipe Service - Handles business logic for recipe operations
 */
const recipeService = {
  /**
   * Create a new recipe
   * @param {Object} recipeData - Recipe details
   * @param {String} userId - ID of the recipe author
   * @returns {Promise<Object>} Created recipe
   */
  async createRecipe(recipeData, userId) {
    const recipe = await Recipe.create({
      ...recipeData,
      author: userId
    });

    return recipe;
  },

  /**
   * Get all recipes with filtering and pagination
   * @param {Object} filters - Filter options (category, difficulty, etc)
   * @param {Object} pagination - Pagination options (page, limit)
   * @returns {Promise<Object>} Recipes and pagination metadata
   */
  async getRecipes(filters = {}, pagination = {}) {
    const { 
      category, 
      difficulty, 
      search,
      minPreparationTime,
      maxPreparationTime, 
      author 
    } = filters;
    
    const { page = 1, limit = 10, sort = '-createdAt' } = pagination;
    
    // Build query
    const query = {};
    
    // Apply filters if provided
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (author) query.author = author;
    
    // Time range filter
    if (minPreparationTime) query.preparationTime = { $gte: Number(minPreparationTime) };
    if (maxPreparationTime) {
      query.preparationTime = { ...query.preparationTime, $lte: Number(maxPreparationTime) };
    }
    
    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Execute query with pagination
    const skip = (page - 1) * limit;
    
    const [recipes, total] = await Promise.all([
      Recipe.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('author', 'username profilePicture')
        .lean(),
      Recipe.countDocuments(query)
    ]);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    return {
      recipes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    };
  },

  /**
   * Get a single recipe by ID
   * @param {String} recipeId - Recipe ID
   * @param {Boolean} includeComments - Whether to include comments
   * @returns {Promise<Object>} Recipe object
   */
  async getRecipeById(recipeId, includeComments = true) {
    const query = Recipe.findById(recipeId)
      .populate('author', 'username profilePicture');
    
    if (includeComments) {
      query.populate({
        path: 'comments',
        options: { sort: { createdAt: -1 } },
        populate: {
          path: 'author',
          select: 'username profilePicture'
        }
      });
    }
    
    const recipe = await query;
    
    if (!recipe) {
      throw new AppError('Recipe not found', 404);
    }
    
    return recipe;
  },

  /**
   * Update a recipe
   * @param {String} recipeId - Recipe ID
   * @param {Object} updateData - Updated recipe data
   * @param {String} userId - ID of the user performing the update
   * @returns {Promise<Object>} Updated recipe
   */
  async updateRecipe(recipeId, updateData, userId) {
    const recipe = await Recipe.findById(recipeId);
    
    if (!recipe) {
      throw new AppError('Recipe not found', 404);
    }
    
    // Check if user is the author
    if (recipe.author.toString() !== userId) {
      throw new AppError('You are not authorized to update this recipe', 403);
    }
    
    // Update recipe
    Object.assign(recipe, updateData);
    await recipe.save();
    
    return recipe;
  },

  /**
   * Delete a recipe
   * @param {String} recipeId - Recipe ID
   * @param {String} userId - ID of the user performing the deletion
   * @returns {Promise<Boolean>} Success indicator
   */
  async deleteRecipe(recipeId, userId) {
    const recipe = await Recipe.findById(recipeId);
    
    if (!recipe) {
      throw new AppError('Recipe not found', 404);
    }
    
    // Check if user is the author
    if (recipe.author.toString() !== userId) {
      throw new AppError('You are not authorized to delete this recipe', 403);
    }
    
    // Delete recipe images from cloudinary
    for (const image of recipe.images) {
      if (image.publicId) {
        await cloudinary.uploader.destroy(image.publicId);
      }
    }
    
    // Delete recipe comments
    await Comment.deleteMany({ recipe: recipeId });
    
    // Delete the recipe
    await recipe.deleteOne();
    
    return true;
  },

  /**
   * Toggle like status for a recipe
   * @param {String} recipeId - Recipe ID
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Updated like count and status
   */
  async toggleLike(recipeId, userId) {
    const recipe = await Recipe.findById(recipeId);
    
    if (!recipe) {
      throw new AppError('Recipe not found', 404);
    }
    
    const isLiked = recipe.likes.includes(userId);
    
    if (isLiked) {
      // Unlike
      recipe.likes = recipe.likes.filter(id => id.toString() !== userId);
    } else {
      // Like
      recipe.likes.push(userId);
    }
    
    await recipe.save();
    
    return {
      likes: recipe.likes.length,
      isLiked: !isLiked
    };
  },

  /**
   * Toggle favorite status for a recipe
   * @param {String} recipeId - Recipe ID
   * @param {String} userId - User ID
   * @returns {Promise<Boolean>} New favorite status
   */
  async toggleFavorite(recipeId, userId) {
    const [recipe, user] = await Promise.all([
      Recipe.findById(recipeId),
      User.findById(userId)
    ]);
    
    if (!recipe) {
      throw new AppError('Recipe not found', 404);
    }
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    const isFavorite = user.favoriteRecipes.includes(recipeId);
    
    if (isFavorite) {
      // Remove from favorites
      user.favoriteRecipes = user.favoriteRecipes.filter(
        id => id.toString() !== recipeId
      );
    } else {
      // Add to favorites
      user.favoriteRecipes.push(recipeId);
    }
    
    await user.save();
    
    return !isFavorite; // Return new status
  },

  /**
   * Get recipes by author
   * @param {String} userId - User ID
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} User's recipes with pagination
   */
  async getUserRecipes(userId, pagination) {
    return this.getRecipes({ author: userId }, pagination);
  },

  /**
   * Get user's favorite recipes
   * @param {String} userId - User ID
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Favorite recipes with pagination
   */
  async getFavoriteRecipes(userId, pagination = {}) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;
    
    // Get user with favorites
    const user = await User.findById(userId).select('favoriteRecipes');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Get favorite recipes
    const [recipes, total] = await Promise.all([
      Recipe.find({ _id: { $in: user.favoriteRecipes } })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('author', 'username profilePicture')
        .lean(),
      user.favoriteRecipes.length
    ]);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;
    
    return {
      recipes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNext,
        hasPrev
      }
    };
  },

  /**
   * Get trending recipes (most liked)
   * @param {Number} limit - Number of recipes to return
   * @returns {Promise<Array>} Trending recipes
   */
  async getTrendingRecipes(limit = 5) {
    const recipes = await Recipe.aggregate([
      { $addFields: { likesCount: { $size: '$likes' } } },
      { $sort: { likesCount: -1, createdAt: -1 } },
      { $limit: limit }
    ]);
    
    // Populate with mongoose after aggregation
    return Recipe.populate(recipes, {
      path: 'author',
      select: 'username profilePicture'
    });
  }
};

module.exports = recipeService;