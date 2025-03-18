const mongoose = require('mongoose');
const Recipe = require('../models/Recipe');
const User = require('../models/User');
const Comment = require('../models/Comment');
const { AppError } = require('../middleware/errorHandler');
const errorMessages = require('../utils/errorMessages');
const imageService = require('./imageService');
const config = require('../config/default');
const cache = require('../utils/cache');

const TRENDING_CACHE_TTL = config.api.caching.trendingRecipes.ttl;
const TRENDING_CACHE_ENABLED = config.api.caching.trendingRecipes.enabled;
const DEFAULT_TRENDING_LIMIT = config.api.caching.trendingRecipes.defaultLimit;

/**
 * Recipe Service - Contains business logic for recipe operations
 */
const recipeService = {
  /**
  * Get recipes with filtering and pagination - optimized version
  */
  async getRecipes(filters = {}, pagination = {}) {
    try {
      // Build query object based on filters
      const queryObj = {};
      
      if (filters.category) {
        queryObj.category = filters.category;
      }
      
      if (filters.difficulty) {
        queryObj.difficulty = filters.difficulty;
      }
      
      if (filters.search) {
        const searchRegex = new RegExp(filters.search, 'i');
        queryObj.$or = [
          { title: { $regex: searchRegex } },
          { description: { $regex: searchRegex } }
        ];
      }
      
      if (filters.minPreparationTime) {
        queryObj.preparationTime = queryObj.preparationTime || {};
        queryObj.preparationTime.$gte = parseInt(filters.minPreparationTime);
      }
      
      if (filters.maxPreparationTime) {
        queryObj.preparationTime = queryObj.preparationTime || {};
        queryObj.preparationTime.$lte = parseInt(filters.maxPreparationTime);
      }
      
      if (filters.author) {
        queryObj.author = filters.author;
      }
      
      // Count total results before pagination (only count once)
      const totalDocs = await Recipe.countDocuments(queryObj);
      
      // Apply pagination
      const page = parseInt(pagination.page) || 1;
      const limit = parseInt(pagination.limit) || 10;
      const skip = (page - 1) * limit;
      
      // Apply sorting
      const sortField = pagination.sort || '-createdAt';
      
      // Execute query with pagination - selective fields for optimization
      const recipes = await Recipe.find(queryObj)
        .select('title description category preparationTime difficulty servings createdAt updatedAt images author likesCount')
        .skip(skip)
        .limit(limit)
        .sort(sortField)
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
      console.error('Error fetching recipes:', error);
      throw error;
    }
  },
    
  /**
   * Get recipe by ID with enhanced user context
   */
  async getRecipeById(id, userId = null, includeComments = true) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(errorMessages.validation.invalidObjectId, 400);
    }
    
    try {
      let query = Recipe.findById(id)
        .select('-likes')
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

      const promises = [
        Comment.countDocuments({ recipe: id }),
        User.countDocuments({ favoriteRecipes: id })
      ];

      let isLikedDoc = null;
      let isFavoriteDoc = null;
    
      if (userId) {
        const [isLikedResult, isFavoriteResult] = await Promise.all([
          Recipe.exists({ _id: id, likes: userId }),
          User.exists({ _id: userId, favoriteRecipes: id })
        ]);
        
        isLikedDoc = isLikedResult;
        isFavoriteDoc = isFavoriteResult;
      }
      
      const [commentCount, followersCount] = await Promise.all(promises);
      
      const recipeObj = recipe.toObject();
      recipeObj.commentCount = commentCount;
      recipeObj.followersCount = followersCount;
      
      recipeObj.isOwner = userId ? (recipe.author._id.toString() === userId.toString()) : false;
      recipeObj.isLiked = !!isLikedDoc;
      recipeObj.isFavorite = !!isFavoriteDoc;
      
      return recipeObj;
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
      // Проверка дали рецептата съществува, но без да извличаме целия документ
      const recipeExists = await Recipe.exists({ _id: recipeId });
      
      if (!recipeExists) {
        throw new AppError(errorMessages.recipe.notFound, 404);
      }
      
      // Проверка дали потребителят вече е харесал рецептата
      const isLiked = await Recipe.exists({ _id: recipeId, likes: userId });
      
      let result;
      
      if (!isLiked) {
        // Добавяне на харесване с атомарна операция
        result = await Recipe.findByIdAndUpdate(
          recipeId,
          { 
            $addToSet: { likes: userId },
            $inc: { likesCount: 1 }
          },
          { new: true, select: 'likesCount' }
        );
        
        // Инвалидиране на кеша с трендиращи рецепти
        if (TRENDING_CACHE_ENABLED) {
          cache.invalidate('trending:');
        }
        
        return { isLiked: true, likeCount: result.likesCount };
      } else {
        // Премахване на харесване с атомарна операция
        result = await Recipe.findByIdAndUpdate(
          recipeId,
          { 
            $pull: { likes: userId },
            $inc: { likesCount: -1 }
          },
          { new: true, select: 'likesCount' }
        );
        
        // Инвалидиране на кеша с трендиращи рецепти
        if (TRENDING_CACHE_ENABLED) {
          cache.invalidate('trending:');
        }
        
        return { isLiked: false, likeCount: result.likesCount };
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
      const recipeExists = await Recipe.exists({ _id: recipeId });
      
      if (!recipeExists) {
        throw new AppError(errorMessages.recipe.notFound, 404);
      }
      
      const userWithFavorite = await User.exists({ 
        _id: userId, 
        favoriteRecipes: recipeId 
      });
      
      if (!userWithFavorite) {
        await User.findByIdAndUpdate(
          userId,
          { $addToSet: { favoriteRecipes: recipeId } }
        );
        
        return { 
          isFavorite: true,
          message: 'Recipe added to favorites'
        };
      } else {
        await User.findByIdAndUpdate(
          userId,
          { $pull: { favoriteRecipes: recipeId } }
        );
        
        return { 
          isFavorite: false, 
          message: 'Recipe removed from favorites'
        };
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw error;
    }
  },
  
  /**
   * Get user's recipes with optimized response format
   */
  async getUserRecipes(userId, pagination = {}, currentUserId = null) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError(errorMessages.validation.invalidObjectId, 400);
    }
    
    try {
      const page = parseInt(pagination.page) || 1;
      const limit = parseInt(pagination.limit) || 10;
      const skip = (page - 1) * limit;
      const sort = pagination.sort || '-createdAt';
      
      const totalDocs = await Recipe.countDocuments({ author: userId });
      
      const recipes = await Recipe.find({ author: userId })
        .select('title description category preparationTime difficulty servings createdAt updatedAt images author likesCount')
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('author', 'username firstName lastName profilePicture')
        .lean();
      
      if (recipes.length > 0) {
        const recipeIds = recipes.map(recipe => recipe._id);
        
        // Calculate followers count (users who favorited these recipes)
        const followerCounts = await User.aggregate([
          { $match: { favoriteRecipes: { $in: recipeIds } } },
          { $unwind: '$favoriteRecipes' },
          { $match: { favoriteRecipes: { $in: recipeIds } } },
          { $group: { _id: '$favoriteRecipes', count: { $sum: 1 } } }
        ]);
        
        const followersMap = {};
        followerCounts.forEach(item => {
          followersMap[item._id.toString()] = item.count;
        });
        
        // Get like and favorite status if currentUserId is provided
        let isLikedMap = {};
        let isFavoriteMap = {};
        
        if (currentUserId) {
          // Check which recipes are liked by the current user
          const likedRecipes = await Recipe.find({
            _id: { $in: recipeIds },
            likes: currentUserId
          }).select('_id').lean();
          
          likedRecipes.forEach(recipe => {
            isLikedMap[recipe._id.toString()] = true;
          });
          
          // Check which recipes are favorited by the current user
          const user = await User.findById(currentUserId)
            .select('favoriteRecipes')
            .lean();
            
          if (user && user.favoriteRecipes) {
            user.favoriteRecipes.forEach(recipeId => {
              isFavoriteMap[recipeId.toString()] = true;
            });
          }
        }

        const isOwner = currentUserId ? userId === currentUserId : false;
        
        // Add extra fields to each recipe
        recipes.forEach(recipe => {
          recipe.followersCount = followersMap[recipe._id.toString()] || 0;
          recipe.isOwner = isOwner;
            
          // Set isLiked and isFavorite based on current user
          recipe.isLiked = isLikedMap[recipe._id.toString()] || false;
          recipe.isFavorite = isFavoriteMap[recipe._id.toString()] || false;
        });
      }
      
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
      console.error('Error fetching user recipes:', error);
      if (error instanceof AppError) throw error;
      throw error;
    }
  },
  
/**
 * Get user's favorite recipes - optimized implementation
 */
async getFavoriteRecipes(userId, pagination = {}) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new AppError(errorMessages.validation.invalidObjectId, 400);
  }
  
  try {
    const user = await User.findById(userId).select('favoriteRecipes');
    
    if (!user) {
      throw new AppError(errorMessages.user.notFound, 404);
    }
    
    const favoriteIds = user.favoriteRecipes;
    
    // Handle empty favorites case
    if (favoriteIds.length === 0) {
      return {
        recipes: [],
        pagination: {
          page: 1,
          limit: pagination.limit || 10,
          total: 0,
          pages: 0,
          hasNext: false,
          hasPrev: false
        }
      };
    }
    
    // Apply pagination
    const page = parseInt(pagination.page) || 1;
    const limit = parseInt(pagination.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Count total favorites
    const totalDocs = favoriteIds.length;
    
    // Get recipes with pagination - ONLY required fields
    const recipes = await Recipe.find({ _id: { $in: favoriteIds } })
      .select('title description category preparationTime difficulty servings createdAt updatedAt images author likesCount')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .populate('author', 'username firstName lastName profilePicture')
      .lean();
    
    if (recipes.length > 0) {
      const recipeIds = recipes.map(recipe => recipe._id);
      
      // Calculate followers count
      const followerCounts = await User.aggregate([
        { $match: { favoriteRecipes: { $in: recipeIds } } },
        { $unwind: '$favoriteRecipes' },
        { $match: { favoriteRecipes: { $in: recipeIds } } },
        { $group: { _id: '$favoriteRecipes', count: { $sum: 1 } } }
      ]);
      
      const followersMap = {};
      followerCounts.forEach(item => {
        followersMap[item._id.toString()] = item.count;
      });
      
      // Check which recipes are liked by this user
      const likedRecipes = await Recipe.find({
        _id: { $in: recipeIds },
        likes: userId
      }).select('_id').lean();
      
      const isLikedMap = {};
      likedRecipes.forEach(recipe => {
        isLikedMap[recipe._id.toString()] = true;
      });
      
      // Add extra fields to each recipe
      recipes.forEach(recipe => {
        recipe.followersCount = followersMap[recipe._id.toString()] || 0;
        recipe.isOwner = String(recipe.author._id) === String(userId);
        recipe.isLiked = isLikedMap[recipe._id.toString()] || false;
        recipe.isFavorite = true;
      });
    }
    
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
    console.error('Error fetching favorite recipes:', error);
    if (error instanceof AppError) throw error;
    throw error;
  }
},
  
  /**
  * Get trending recipes with clear labeling of trending vs popular
  */
  async getTrendingRecipes(limit = DEFAULT_TRENDING_LIMIT) {
    try {

      if (TRENDING_CACHE_ENABLED) {
        const cacheKey = `trending:${limit}`;
        const cachedData = cache.get(cacheKey, TRENDING_CACHE_TTL);
        
        if (cachedData) {
          return cachedData;
        }
      }

      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      
      let trendingRecipes = await Recipe.aggregate([
        { $match: { 
          createdAt: { $gte: lastMonth },
          likesCount: { $gt: 0 }
        }},
        
        { $addFields: { 
          _score: { 
            $divide: [
              "$likesCount", 
              { 
                $add: [
                  { 
                    $divide: [
                      { $subtract: [new Date(), "$createdAt"] },
                      1000 * 60 * 60 * 24
                    ]
                  }, 
                  1
                ] 
              }
            ] 
          }
        }},
        
        { $sort: { _score: -1 } },
        
        { $project: {
          title: 1,
          description: 1,
          category: 1,
          preparationTime: 1,
          difficulty: 1,
          servings: 1,
          images: 1,
          author: 1,
          createdAt: 1,
          updatedAt: 1,
          likesCount: 1,
          type: { $literal: "trending" }
        }},
        
        { $limit: limit }
      ]);

      if (trendingRecipes.length < limit) {
        const existingIds = trendingRecipes.map(r => r._id);
        
        const popularRecipes = await Recipe.aggregate([
          { $match: { 
            _id: { $nin: existingIds }
          }},
          { $sort: { likesCount: -1, createdAt: -1} }, 
          { $project: {
            title: 1,
            description: 1,
            category: 1,
            preparationTime: 1,
            difficulty: 1,
            servings: 1,
            images: 1,
            author: 1,
            createdAt: 1,
            updatedAt: 1,
            likesCount: 1,
            type: { $literal: "popular" }
          }},
          { $limit: limit - trendingRecipes.length }
        ]);
        
        trendingRecipes = [...trendingRecipes, ...popularRecipes];
      }

      await Recipe.populate(trendingRecipes, {
        path: 'author',
        select: 'username firstName lastName profilePicture'
      });

      if (TRENDING_CACHE_ENABLED) {
        const cacheKey = `trending:${limit}`;
        cache.set(cacheKey, trendingRecipes);
      }
           
      return trendingRecipes;
    } catch (error) {
      console.error('Error getting trending recipes:', error);
      throw error;
    }
  }
};

module.exports = recipeService;