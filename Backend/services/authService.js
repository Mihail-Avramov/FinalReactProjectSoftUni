const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { AppError, AuthenticationError } = require('../middleware/errorHandler');
const config = require('../config/default');
const errorMessages = require('../utils/errorMessages');

const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} User data and token
   */
  async registerUser(userData) {
    const { email, username } = userData;
    
    // Check if email exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      throw new AppError(errorMessages.auth.accountExists, 409);
    }
    
    // Check if username exists
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      throw new AppError(errorMessages.auth.usernameTaken, 409);
    }
    
    // Create new user
    const user = await User.create(userData);
    
    // Generate JWT token
    const token = this.generateToken(user._id);
    
    // Return user data and token
    return {
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        bio: user.bio
      },
      token
    };
  },
  
  /**
   * Login user
   * @param {String} email - User email
   * @param {String} password - User password
   * @returns {Promise<Object>} User data and token
   */
  async loginUser(email, password) {
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      throw new AuthenticationError(errorMessages.auth.invalidCredentials);
    }
    
    // Check if password is correct
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError(errorMessages.auth.invalidCredentials);
    }
    
    // Generate JWT token
    const token = this.generateToken(user._id);
    
    return {
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        bio: user.bio
      },
      token
    };
  },
  
  /**
   * Generate JWT token
   * @param {String} userId - User ID
   * @returns {String} JWT token
   */
  generateToken(userId) {
    return jwt.sign(
      { id: userId },
      process.env.JWT_SECRET,
      { expiresIn: config.auth.jwtExpiry }
    );
  }
};

module.exports = authService;