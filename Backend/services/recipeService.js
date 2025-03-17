const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { AppError } = require('../middleware/errorHandler');
const errorMessages = require('../utils/errorMessages');
const imageService = require('./imageService');

/**
 * Recipe Service - Contains business logic for recipe operations
 */
const recipeService = {
  /**
   * Get recipes with filtering and pagination
   */
  async getRecipes(filters = {}, pagination = {}) {
    try {
      let query = Recipe.find();
      
      // Apply filters
      if (filters.category) {
        query = query.where('category').equals(filters.category);
      }
      
      if (filters.difficulty) {
        query = query.where('difficulty').equals(filters.difficulty);
      }
      
      if (filters.search) {
        const searchRegex = new RegExp(filters.search, 'i');
        query = query.or([
          { title: { $regex: searchRegex } },
          { description: { $regex: searchRegex } }
        ]);
      }
      
      if (filters.minPreparationTime) {
        query = query.where('preparationTime').gte(parseInt(filters.minPreparationTime));
      }
      
      if (filters.maxPreparationTime) {
        query = query.where('preparationTime').lte(parseInt(filters.maxPreparationTime));
      }
      
      if (filters.author) {
        query = query.where('author').equals(filters.author);
      }
      
      // Count total results before pagination
      const totalDocs = await Recipe.countDocuments(query);
      
      // Apply pagination
      const page = parseInt(pagination.page) || 1;
      const limit = parseInt(pagination.limit) || 10;
      const skip = (page - 1) * limit;
      
      // Apply sorting
      if (pagination.sort) {
        query = query.sort(pagination.sort);
      } else {
        query = query.sort('-createdAt');
      }
      
      // Execute query with pagination
      const recipes = await query
        .skip(skip)
        .limit(limit)
        .populate('author', 'username firstName lastName profilePicture')
        .lean();

      const recipeIds = recipes.map(recipe => recipe._id);

      const commentCounts = await Comment.aggregate([
        { $match: { recipe: { $in: recipeIds } } },
        { $group: { _id: "$recipe", count: { $sum: 1 } } }
      ]);

      const commentCountMap = {};
      commentCounts.forEach(item => {
        commentCountMap[item._id.toString()] = item.count;
      });

      recipes.forEach(recipe => {
        recipe.commentCount = commentCountMap[recipe._id.toString()] || 0;
      });
      
      // Calculate pagination info
      const totalPages = Math.ceil(totalDocs / limit);
      
      return {
        recipes,
        pagination: {
          page,
          limit,
          total: totalDocs,
          pages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  },
  
  /**
   * Get recipe by ID
   */
  async getRecipeById(id, includeComments = true) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(errorMessages.validation.invalidObjectId, 400);
    }
    
    try {
      let query = Recipe.findById(id)
        .populate('author', 'username firstName lastName profilePicture bio');
      
      if (includeComments) {
        query = query.populate({
          path: 'comments',
          options: { sort: { createdAt: -1 }, limit: 5 },
          populate: {
            path: 'author',
            select: 'username firstName lastName profilePicture'
          }
        });
      }
      
      const recipe = await query;
      
      if (!recipe) {
        throw new AppError(errorMessages.recipe.notFound, 404);
      }

      const commentCount = await Comment.countDocuments({ recipe: id });
      recipe.commentCount = commentCount;
      
      return recipe;
    } catch (error) {
      if (error instanceof AppError) throw error;
      if (error.name === 'CastError') {
        throw new AppError(errorMessages.validation.invalidObjectId, 400);
      }
      throw error;
    }
  },
    
  /**
   * Create a new recipe
   */
  async createRecipe(recipeData, authorId) {
    let uploadedImages = [];
    
    try {
      if (recipeData.imageFiles && recipeData.imageFiles.length > 0) {
        try {
          // Директно подаваме файловете към подобрения метод
          uploadedImages = await imageService.uploadMultipleImages(recipeData.imageFiles, 'recipes');
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          throw new AppError(errorMessages.image.uploadFailed, 400);
        }
      }
      
      delete recipeData.imageFiles;
      recipeData.images = uploadedImages;
      
      const recipe = new Recipe({
        ...recipeData,
        author: authorId,
        likes: []
      });
      
      await recipe.save();
      
      await recipe.populate('author', 'username firstName lastName profilePicture');
      
      return recipe;
    } catch (error) {
      if (uploadedImages.length > 0) {
        await imageService.deleteMultipleImages(uploadedImages);
        console.log(`Cleaned up ${uploadedImages.length} images after failed recipe creation`);
      }
      throw error;
    }
  },
  
  /**
   * Update an existing recipe
   */
  async updateRecipe(recipeId, updateData, existingRecipe = null) {
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      throw new AppError(errorMessages.validation.invalidObjectId, 400);
    }
    
    let uploadedImages = [];
    
    try {
      let recipe = existingRecipe;
      if (!recipe) {
        recipe = await Recipe.findById(recipeId);
        if (!recipe) {
          throw new AppError(errorMessages.recipe.notFound, 404);
        }
      }

      if (updateData.imageFiles && updateData.imageFiles.length > 0) {
        try {
          uploadedImages = await imageService.uploadMultipleImages(updateData.imageFiles, 'recipes');
        } catch (uploadError) {
          console.error('Error uploading images:', uploadError);
          throw new AppError(errorMessages.image.uploadFailed, 400);
        }
      }
      
      let imagesToDelete = [];
      let updatedImages = [...recipe.images];
      
      if (updateData.removedImages && updateData.removedImages.length > 0) {
        imagesToDelete = recipe.images.filter(img => 
          updateData.removedImages.some(removedImg => 
            removedImg === img.url || removedImg === img.publicId
          )
        );
      
        updatedImages = recipe.images.filter(img => 
          !updateData.removedImages.some(removedImg => 
            removedImg === img.url || removedImg === img.publicId
          )
        );
      }
      
      if (uploadedImages.length > 0) {
        updatedImages = [...updatedImages, ...uploadedImages];
      }
      
      delete updateData.removedImages;
      delete updateData.imageFiles;

      const updatedRecipe = await Recipe.findByIdAndUpdate(
        recipeId,
        { 
          ...updateData,
          images: updatedImages,
          updatedAt: Date.now()
        },
        { new: true, runValidators: true }
      ).populate('author', 'username firstName lastName profilePicture');
      
      if (imagesToDelete.length > 0) {
        await imageService.deleteMultipleImages(imagesToDelete);
        console.log(`Successfully deleted ${imagesToDelete.length} removed images`);
      }
      
      return updatedRecipe;
    } catch (error) {
      if (uploadedImages.length > 0) {
        await imageService.deleteMultipleImages(uploadedImages);
        console.log(`Cleaned up ${uploadedImages.length} newly uploaded images after failed update`);
      }
      
      if (error instanceof AppError) throw error;
      throw error;
    }
  },
  
  /**
   * Delete a recipe
   */
  async deleteRecipe(recipeId, existingRecipe = null) {
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      throw new AppError(errorMessages.validation.invalidObjectId, 400);
    }
    
    try {
      let recipe = existingRecipe;
      if (!recipe) {
        recipe = await Recipe.findById(recipeId);
        if (!recipe) {
          throw new AppError(errorMessages.recipe.notFound, 404);
        }
      }

      await Comment.deleteMany({ recipe: recipeId });
      
      await Recipe.findByIdAndDelete(recipeId);
      
      if (recipe.images && recipe.images.length > 0) {
        await imageService.deleteMultipleImages(recipe.images);
        console.log(`Successfully deleted ${recipe.images.length} images from deleted recipe`);
      }
      
      return true;
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(errorMessages.recipe.deleteError, 500);
    }
  },
  
  /**
   * Toggle like status for a recipe
   */
  async toggleLike(recipeId, userId) {
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      throw new AppError(errorMessages.validation.invalidObjectId, 400);
    }
    
    try {
      const recipe = await Recipe.findById(recipeId);
      
      if (!recipe) {
        throw new AppError(errorMessages.recipe.notFound, 404);
      }
      
      // Check if user already liked the recipe
      const userLikedIndex = recipe.likes.findIndex(
        like => like.toString() === userId.toString()
      );
      
      if (userLikedIndex === -1) {
        // Add like
        recipe.likes.push(userId);
        await recipe.save();
        return { isLiked: true, likeCount: recipe.likes.length };
      } else {
        // Remove like
        recipe.likes.splice(userLikedIndex, 1);
        await recipe.save();
        return { isLiked: false, likeCount: recipe.likes.length };
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw error;
    }
  },
  
  /**
   * Toggle favorite status for a recipe
   */
  async toggleFavorite(recipeId, userId) {
    if (!mongoose.Types.ObjectId.isValid(recipeId)) {
      throw new AppError(errorMessages.validation.invalidObjectId, 400);
    }
    
    try {
      const recipe = await Recipe.findById(recipeId);
      
      if (!recipe) {
        throw new AppError(errorMessages.recipe.notFound, 404);
      }
      
      // Find user
      const user = await User.findById(userId);
      
      if (!user) {
        throw new AppError(errorMessages.user.notFound, 404);
      }
      
      // Check if recipe is in favorites
      const favoriteIndex = user.favoriteRecipes.findIndex(
        id => id.toString() === recipeId.toString()
      );
      
      if (favoriteIndex === -1) {
        // Add to favorites
        user.favoriteRecipes.push(recipeId);
        await user.save();
        return true; // is now favorite
      } else {
        // Remove from favorites
        user.favoriteRecipes.splice(favoriteIndex, 1);
        await user.save();
        return false; // is no longer favorite
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw error;
    }
  },
  
  /**
   * Get user's recipes
   */
  async getUserRecipes(userId, pagination = {}) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError(errorMessages.validation.invalidObjectId, 400);
    }
    
    try {
      const page = parseInt(pagination.page) || 1;
      const limit = parseInt(pagination.limit) || 10;
      const skip = (page - 1) * limit;
      const sort = pagination.sort || '-createdAt';
      
      // Find recipes by author
      const query = Recipe.find({ author: userId });
      const totalDocs = await Recipe.countDocuments({ author: userId });
      
      // Apply pagination and populate author
      const recipes = await query
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('author', 'username firstName lastName profilePicture')
        .lean();
      
      // Calculate pagination info
      const totalPages = Math.ceil(totalDocs / limit);
      
      return {
        recipes,
        pagination: {
          page,
          limit,
          total: totalDocs,
          pages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw error;
    }
  },
  
  /**
   * Get user's favorite recipes
   */
  async getFavoriteRecipes(userId, pagination = {}) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError(errorMessages.validation.invalidObjectId, 400);
    }
    
    try {
      // Get user with favorites
      const user = await User.findById(userId).select('favoriteRecipes');
      
      if (!user) {
        throw new AppError(errorMessages.user.notFound, 404);
      }
      
      const favoriteIds = user.favoriteRecipes;
      
      // Apply pagination
      const page = parseInt(pagination.page) || 1;
      const limit = parseInt(pagination.limit) || 10;
      const skip = (page - 1) * limit;
      
      // Count total favorites
      const totalDocs = favoriteIds.length;
      
      // Get recipes with pagination
      const recipes = await Recipe.find({ _id: { $in: favoriteIds } })
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .populate('author', 'username firstName lastName profilePicture')
        .lean();
      
      // Calculate pagination info
      const totalPages = Math.ceil(totalDocs / limit);
      
      return {
        recipes,
        pagination: {
          page,
          limit,
          total: totalDocs,
          pages: totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw error;
    }
  },
  
  /**
   * Get trending recipes based on likes and recency
   */
  async getTrendingRecipes(limit = 5) {
    try {
      // Get recipes with most likes within the last month
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      const recipes = await Recipe.aggregate([
        // Filter by date
        { $match: { createdAt: { $gte: lastMonth } } },
        // Add fields for sorting
        { $addFields: { 
          likesCount: { $size: "$likes" },
          daysSinceCreation: {
            $divide: [
              { $subtract: [new Date(), "$createdAt"] },
              1000 * 60 * 60 * 24 // Convert ms to days
            ]
          }
        }},
        // Calculate score: likes count / days (recent recipes score higher)
        { $addFields: { 
          score: { 
            $cond: {
              if: { $eq: ["$daysSinceCreation", 0] },
              then: "$likesCount",
              else: { $divide: ["$likesCount", "$daysSinceCreation"] }
            }
          }
        }},
        // Sort by score (trending)
        { $sort: { score: -1 } },
        // Limit results
        { $limit: limit }
      ]);

      // Populate author information
      await Recipe.populate(recipes, {
        path: 'author',
        select: 'username firstName lastName profilePicture'
      });
      
      return recipes;
    } catch (error) {
      console.error('Error getting trending recipes:', error);
      throw error;
    }
  }
};

module.exports = recipeService;