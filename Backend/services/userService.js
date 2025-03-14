const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Comment = require('../models/Comment');
const config = require('../config/default');
const mongoose = require('mongoose');
const { AppError } = require('../middleware/errorHandler');
const imageService = require('./imageService');
const { extractPublicIdFromUrl } = require('../utils/cloudinary');

/**
 * User Service - Handles business logic for user operations
 */
const userService = {
  /**
   * Get user by ID
   * @param {String} userId - User ID
   * @param {Boolean} includePrivateData - Whether to include private user data
   * @returns {Promise<Object>} User object
   */
  async getUserById(userId, includePrivateData = false) {
    const user = await User.findById(userId)
      .select(includePrivateData ? '+email' : '-email')
      .lean();
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    return user;
  },

  /**
   * Get user profile by username
   * @param {String} username - Username to find
   * @returns {Promise<Object>} User profile data
   */
  async getUserByUsername(username) {
    const user = await User.findOne({ username })
      .select('-__v')
      .lean();
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Count recipes
    const recipeCount = await Recipe.countDocuments({ author: user._id });
    
    return {
      ...user,
      recipeCount
    };
  },

  /**
   * Update user profile
   * @param {String} userId - User ID
   * @param {Object} updateData - Updated user data
   * @returns {Promise<Object>} Updated user
   */
  async updateProfile(userId, updateData) {
    // Don't allow updating sensitive fields
    const { username, firstName, lastName, bio } = updateData;
    
    // Check if username is being changed and is already taken
    if (username) {
      const existingUser = await User.findOne({ username, _id: { $ne: userId } });
      if (existingUser) {
        throw new AppError('Username already taken', 400);
      }
    }

    // Update user
    const user = await User.findByIdAndUpdate(
      userId, 
      { username, firstName, lastName, bio },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    return {
      id: user._id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      profilePicture: user.profilePicture
    };
  },

  /**
   * Update user profile picture
   * @param {String} userId - User ID
   * @param {String} imageData - Base64 encoded image
   * @returns {Promise<Object>} Updated user data
   */
  async updateProfilePicture(userId, imageData) {
    // Find the current user to get their existing profile picture
    const currentUser = await User.findById(userId);
    
    if (!currentUser) {
      throw new AppError('User not found', 404);
    }
    
    // Only delete the old picture if it's not the default
    if (currentUser.profilePicture !== config.user.defaultProfilePicture) {
      const oldImagePublicId = extractPublicIdFromUrl(currentUser.profilePicture);
      if (oldImagePublicId) {
        try {
          await imageService.deleteImage(oldImagePublicId);
        } catch (error) {
          console.error('Failed to delete old profile picture:', error);
        }
      }
    }
    
    // Upload new image to Cloudinary
    const image = await imageService.uploadProfilePicture(imageData);
    
    // Update user profile with new image URL
    const user = await User.findByIdAndUpdate(
      userId,
      { profilePicture: image.url },
      { new: true }
    );
    
    return {
      id: user._id,
      profilePicture: user.profilePicture
    };
  },

  /**
   * Reset profile picture to default
   * @param {String} userId - User ID
   * @returns {Promise<Object>} Updated user data
   */
  async resetProfilePicture(userId) {
    // Find the current user
    const currentUser = await User.findById(userId);
    
    if (!currentUser) {
      throw new AppError('User not found', 404);
    }
    
    // Only delete the current picture if it's not already the default
    if (currentUser.profilePicture !== config.user.defaultProfilePicture) {
      const publicId = extractPublicIdFromUrl(currentUser.profilePicture);
      if (publicId) {
        try {
          await imageService.deleteImage(publicId);
        } catch (error) {
          console.error('Failed to delete profile picture:', error);
        }
      }
      
      // Update user to use default profile picture
      const user = await User.findByIdAndUpdate(
        userId,
        { profilePicture: config.user.defaultProfilePicture },
        { new: true }
      );
      
      return {
        id: user._id,
        profilePicture: user.profilePicture
      };
    }
    
    // Already using default picture
    return {
      id: currentUser._id,
      profilePicture: currentUser.profilePicture
    };
  },

  /**
   * Change user password
   * @param {String} userId - User ID
   * @param {String} currentPassword - Current password
   * @param {String} newPassword - New password
   * @returns {Promise<Boolean>} Success indicator
   */
  async changePassword(userId, currentPassword, newPassword) {
    // Find user with password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Check if current password is correct
    const isPasswordCorrect = await user.comparePassword(currentPassword);
    if (!isPasswordCorrect) {
      throw new AppError('Current password is incorrect', 401);
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    return true;
  },

  /**
   * Delete user account
   * @param {String} userId - User ID
   * @param {String} password - Password for verification
   * @returns {Promise<Boolean>} Success indicator
   */
  async deleteAccount(userId, password) {
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      throw new AppError('Invalid password', 401);
    }
    
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Check if profile picture is NOT the default before attempting to delete
      if (user.profilePicture && user.profilePicture !== config.user.defaultProfilePicture) {
        const profilePicPublicId = extractPublicIdFromUrl(user.profilePicture);
        if (profilePicPublicId) {
          await imageService.deleteImage(profilePicPublicId);
        }
      }
      
      // Find recipes to delete their images
      const recipes = await Recipe.find({ author: userId });
      
      // Delete recipe images from Cloudinary
      for (const recipe of recipes) {
        if (recipe.images && recipe.images.length > 0) {
          for (const image of recipe.images) {
            // Use publicId if available, otherwise extract from URL
            const imageId = image.publicId || extractPublicIdFromUrl(image.url);
            if (imageId) {
              await imageService.deleteImage(imageId);
            }
          }
        }
      }
      
      // Delete all recipes by user
      await Recipe.deleteMany({ author: userId }, { session });
      
      // Delete all comments by user
      await Comment.deleteMany({ author: userId }, { session });
      
      // Remove user's likes from recipes
      await Recipe.updateMany(
        { likes: userId },
        { $pull: { likes: userId } },
        { session }
      );
      
      // Delete user
      await User.findByIdAndDelete(userId, { session });
      
      // Commit transaction
      await session.commitTransaction();
      
      return true;
    } catch (error) {
      // If an error occurs, abort the transaction
      await session.abortTransaction();
      console.error('Error deleting user account:', error);
      throw new AppError('Failed to delete account', 500);
    } finally {
      // End the session
      session.endSession();
    }
  },

  /**
   * Get user statistics
   * @param {String} userId - User ID
   * @returns {Promise<Object>} User statistics
   */
  async getUserStats(userId) {
    // Verify user exists
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Get all recipes by the user
    const recipes = await Recipe.find({ author: userId });
    
    // Calculate total likes across all recipes
    const totalLikes = recipes.reduce((sum, recipe) => sum + (recipe.likes?.length || 0), 0);
    
    // Get comment count
    const commentsCount = await Comment.countDocuments({ author: userId });
    
    // Count favorites
    const favoriteRecipesCount = user.favoriteRecipes?.length || 0;
    
    // Find most used category
    const categories = recipes.map(recipe => recipe.category);
    const mostPopularCategory = categories.length > 0 ? 
      categories.sort((a,b) => 
        categories.filter(v => v === a).length - categories.filter(v => v === b).length
      ).pop() : 'none';
    
    // Find most liked recipe
    let mostLikedRecipe = null;
    if (recipes.length > 0) {
      const sorted = [...recipes].sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0));
      if (sorted[0]?.likes?.length > 0) {
        mostLikedRecipe = {
          _id: sorted[0]._id,
          title: sorted[0].title,
          likes: sorted[0].likes.length
        };
      }
    }
    
    // Calculate activity metrics
    const lastRecipe = recipes.length > 0 ? 
      recipes.sort((a, b) => b.createdAt - a.createdAt)[0].createdAt : null;
    
    const lastComment = await Comment.findOne({ author: userId })
      .sort({ createdAt: -1 })
      .select('createdAt');
    
    const memberSince = user.createdAt;
    const daysActive = Math.floor((Date.now() - memberSince) / (1000 * 60 * 60 * 24));
    
    return {
      recipesCount: recipes.length,
      totalLikes,
      averageLikesPerRecipe: recipes.length > 0 ? (totalLikes / recipes.length).toFixed(1) : 0,
      commentsCount,
      favoriteRecipesCount,
      mostPopularCategory,
      mostLikedRecipe,
      activity: {
        lastRecipe,
        lastComment: lastComment?.createdAt || null,
        memberSince,
        daysActive
      }
    };
  }
};

module.exports = userService;