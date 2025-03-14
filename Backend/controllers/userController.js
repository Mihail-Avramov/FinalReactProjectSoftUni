const userService = require('../services/userService');
const { AppError } = require('../middleware/errorHandler');
const mongoose = require('mongoose');
const errorMessages = require('../utils/errorMessages');
const { 
  profileUpdateValidation, 
  passwordChangeValidation 
} = require('../utils/validation');

/**
 * Get user profile by ID or username
 */
exports.getUserProfile = async (req, res, next) => {
  try {
    let user;
    
    if (req.params.username) {
      user = await userService.getUserByUsername(req.params.username);
    } else if (req.params.id) {
      user = await userService.getUserById(req.params.id);
    } else {
      return next(new AppError(errorMessages.user.identifierRequired, 400));
    }
    
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
 * Get user statistics
 */
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.params.id || req.user._id;
    
    // Validate MongoDB ObjectId format if provided in URL
    if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
      return next(new AppError(errorMessages.validation.invalidObjectId, 400));
    }
    
    console.log(`Getting stats for user ID: ${userId}`);
    
    const stats = await userService.getUserStats(userId);
    
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