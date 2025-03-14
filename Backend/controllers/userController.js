const userService = require('../services/userService');
const { AppError } = require('../middleware/errorHandler');
const mongoose = require('mongoose');
const errorMessages = require('../utils/errorMessages');
const { 
  profileUpdateValidation, 
  passwordChangeValidation 
} = require('../utils/validation');

/**
 * Smart profile access function that supports:
 * - Public profile view by ID (if not authenticated or not own profile)
 * - Full profile view for authenticated users viewing their own profile
 * - Full profile view when no ID is provided (current user)
 */
exports.getProfileById = async (req, res, next) => {
  try {
    let userId = req.params.id;
    let isOwnProfile = false;
    
    // Случай: GET /profile без ID = текущия потребител (само за логнати потребители)
    if (!userId && req.user) {
      userId = req.user._id;
      isOwnProfile = true;
    }
    
    // Валидация на ID формата 
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
      return next(new AppError(errorMessages.validation.invalidObjectId, 400));
    }
    
    // Проверка дали това е профилът на текущия потребител
    if (!isOwnProfile && req.user && req.user._id.toString() === userId) {
      isOwnProfile = true;
    }
    
    // Дали да включим лична информация? Само ако това е собственият профил
    const includePrivateData = isOwnProfile;
    
    // Взимаме профила с подходящите полета
    const user = await userService.getUserById(userId, includePrivateData);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
exports.updateProfile = [
  profileUpdateValidation,
  async (req, res, next) => {
    try {
      const userId = req.user._id;
      const { username, firstName, lastName, bio } = req.body;
      
      // You can add extra validation here if needed
      if (!username && !firstName && !lastName && bio === undefined) {
        return next(new AppError('No changes provided', 400));
      }
      
      // Handle the profile update
      const updatedUser = await userService.updateProfile(userId, {
        username,
        firstName,
        lastName,
        bio
      });
      
      res.status(200).json({
        success: true,
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  }
];

/**
 * Update profile picture
 */
exports.updateProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError(errorMessages.image.noImageUploaded, 400));
    }
    
    // Convert buffer to base64 string for Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    const result = await userService.updateProfilePicture(req.user._id, dataURI);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Reset profile picture to default
 */
exports.resetProfilePicture = async (req, res, next) => {
  try {
    const result = await userService.resetProfilePicture(req.user._id);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Change user password
 */
exports.changePassword = [
  passwordChangeValidation,
  async (req, res, next) => {
    try {
      const { currentPassword, newPassword } = req.body;
      await userService.changePassword(req.user._id, currentPassword, newPassword);
      
      res.status(200).json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      next(error);
    }
  }
];

/**
 * Delete user account
 */
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return next(new AppError(errorMessages.validation.passwordRequired, 400));
    }
    
    await userService.deleteAccount(req.user._id, password);
    
    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user statistics - supports public and private stats
 * - Returns full stats for the current user
 * - Returns limited stats for other users
 */
exports.getUserStats = async (req, res, next) => {
  try {
    let userId = req.params.id;
    let isOwnProfile = false;
    
    // Case: GET /stats without ID = current user's stats
    if (!userId) {
      userId = req.user._id;
      isOwnProfile = true;
    }
    
    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return next(new AppError(errorMessages.validation.invalidObjectId, 400));
    }
    
    // Check if accessing own profile
    if (!isOwnProfile && req.user && req.user._id.toString() === userId) {
      isOwnProfile = true;
    }
    
    // Get stats with a flag indicating if we should include private data
    const stats = await userService.getUserStats(userId, isOwnProfile);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    // Convert MongoDB/Mongoose specific errors to user-friendly messages
    if (error.name === 'CastError' && error.kind === 'ObjectId') {
      return next(new AppError(errorMessages.validation.invalidObjectId, 400));
    }
    next(error);
  }
};