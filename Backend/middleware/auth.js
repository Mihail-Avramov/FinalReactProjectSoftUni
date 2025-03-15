const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Recipe = require('../models/Recipe');
const { AppError } = require('./errorHandler');
const errorMessages = require('../utils/errorMessages');

exports.protect = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return next(new AppError(errorMessages.auth.unauthorized, 401));
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError(errorMessages.user.notFound, 401));
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError(errorMessages.auth.tokenExpired, 401));
    }
    return next(new AppError(errorMessages.auth.invalidToken, 401));
  }
};

// Check if user is recipe author
exports.isRecipeOwner = async (req, res, next) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user._id;

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return next(new AppError(errorMessages.recipe.notFound, 404));
    }

    // Check if user is the author
    if (recipe.author.toString() !== userId.toString()) {
      return next(new AppError(errorMessages.recipe.unauthorized, 403));
    }

    req.recipe = recipe;
    next();
  } catch (error) {
    next(error);
  }
};

// Optional authentication middleware
// Attempts to authenticate the user, but continues regardless of result
exports.optionalAuth = async (req, res, next) => {
  let token;

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // If no token, just continue (no error)
  if (!token) {
    return next();
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await User.findById(decoded.id);
    
    if (user) {
      req.user = user; // Set user if found
    }
    
    next();
  } catch (error) {
    // Silent fail - just continue without setting user
    next();
  }
};