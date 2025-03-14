const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { AppError } = require('../middleware/errorHandler');
const config = require('../config/default');

const authService = {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Object} User data and token
   */
  async registerUser(userData) {
    const { email, username } = userData;
    
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        throw new AppError('Email already in use', 409);
      } else {
        throw new AppError('Username already taken', 409);
      }
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
        profilePicture: user.profilePicture
      },
      token
    };
  },
  
  /**
   * Log in a user
   * @param {String} email - User email
   * @param {String} password - User password
   * @returns {Object} User data and token
   */
  async loginUser(email, password) {
    // Find user by email
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }
    
    // Generate token
    const token = this.generateToken(user._id);
    
    // Return user data without password and token
    return {
      user: {
        _id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture
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