const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { AppError, AuthenticationError } = require('../middleware/errorHandler');
const config = require('../config/default');
const errorMessages = require('../utils/errorMessages');
const imageService = require('../services/imageService');
const emailService = require('./emailService');
const BlacklistedToken = require('../models/BlacklistedToken');
const crypto = require('crypto');

const authService = {
  /**
   * Register a new user with email verification
   * @param {Object} userData - User registration data
   * @returns {Object} Success message
   */
  async registerUser(userData) {
    const { email, username, profileImage, ...otherData } = userData;
    
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
    
    // Process profile image if provided
    let profilePicture;
    if (profileImage) {
      try {
        // Convert buffer to base64 string for Cloudinary
        const b64 = Buffer.from(profileImage.buffer).toString('base64');
        const dataURI = `data:${profileImage.mimetype};base64,${b64}`;
        
        // Upload to Cloudinary
        const uploadResult = await imageService.uploadProfilePicture(dataURI);
        profilePicture = uploadResult.url;
      } catch (error) {
        throw new AppError(errorMessages.image.uploadFailed, 400);
      }
    }
    
    // Create user with verification token
    const user = await User.create({
      ...otherData,
      email,
      username,
      profilePicture,
      isVerified: false
    });
    
    // Generate verification token
    const verificationToken = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });
    
    // Create verification URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;
    
    try {
      // Send verification email
      await emailService.sendVerificationEmail({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        verificationUrl
      });
      
      return { 
        message: 'Registration successful! Please check your email to verify your account.' 
      };
    } catch (error) {
      // If email fails, still create the user but log the error
      console.error('Failed to send verification email:', error);
      
      return {
        message: 'Registration successful! Please check your email to verify your account.',
        warning: 'Verification email could not be sent. Please contact support.'
      };
    }
  },
  
  /**
   * Login user with verification check
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
    
    // Check if user is verified
    if (!user.isVerified) {
      throw new AuthenticationError('Please verify your email address before logging in.');
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
   * Verify user email with token
   * @param {String} token - Verification token
   * @returns {Promise<Object>} Success message
   */
  async verifyEmail(token) {
    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
    
    // Find user with valid token
    const user = await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpire: { $gt: Date.now() }
    });
    
    if (!user) {
      throw new AppError('Invalid or expired verification token', 400);
    }
    
    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpire = undefined;
    
    await user.save({ validateBeforeSave: false });
    
    return { message: 'Email verified successfully! You can now log in.' };
  },
  
  /**
   * Resend verification email
   * @param {String} email - User email
   * @returns {Promise<Object>} Success message
   */
  async resendVerificationEmail(email) {
    // Find user by email
    const user = await User.findOne({ email });
    
    // We return the same response even if user doesn't exist, for security
    if (!user) {
      return { message: 'If that email exists, we have sent a verification link' };
    }

    if (user.isVerified === undefined) {
      user.isVerified = false;
    }
    
    // Don't resend if already verified
    if (user.isVerified) {
      return { message: 'This email is already verified' };
    }
    
    // Generate new verification token
    const verificationToken = user.generateVerificationToken();
    await user.save({ validateBeforeSave: false });
    
    // Create verification URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;
    
    try {
      // Send verification email
      await emailService.sendVerificationEmail({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        verificationUrl
      });
      
      return { message: 'If that email exists, we have sent a verification link' };
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new AppError('Failed to send verification email', 500);
    }
  },
  
  /**
   * Logout user by blacklisting the token
   * @param {String} token - JWT token to blacklist
   * @returns {Promise<Object>} Success message
   */
  async logoutUser(token) {
    try {
      // Decode token to get expiration date without verification
      const decoded = jwt.decode(token);
      
      if (!decoded || !decoded.exp) {
        throw new AppError('Invalid token format', 400);
      }
      
      // Calculate expiry date
      const expiresAt = new Date(decoded.exp * 1000);
      
      // Add token to blacklist
      await BlacklistedToken.create({
        token,
        expiresAt
      });
      
      return { message: 'Successfully logged out' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      
      throw new AppError('Logout failed, please try again', 500);
    }
  },
  
  /**
   * Verify if token is valid and not blacklisted
   * @param {String} token - JWT token to verify
   * @returns {Promise<Object>} User data if token is valid
   */
  async verifyToken(token) {
    try {
      // Check if token is blacklisted
      const blacklisted = await BlacklistedToken.findOne({ token });
      if (blacklisted) {
        throw new AuthenticationError('Token is no longer valid');
      }
      
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user data
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw new AuthenticationError('User not found');
      }
      
      return {
        _id: user._id,
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        profilePicture: user.profilePicture,
        bio: user.bio
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      
      if (error.name === 'TokenExpiredError') {
        throw new AuthenticationError('Token has expired');
      }
      
      throw new AuthenticationError('Invalid token');
    }
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
  },

  /**
   * Handle forgot password process
   * @param {String} email - User email
   * @returns {Promise<Object>} Success message
   */
  async forgotPassword(email) {
    try {
      const user = await User.findOne({ email });
      
      // Дори ако потребителят не съществува, връщаме същия отговор
      // за избягване на разкриване на информация за валидни имейли
      if (!user) {
        return { message: 'If that email exists, we have sent a password reset link' };
      }
      
      // Генерираме токен за ресет
      const resetToken = user.generatePasswordResetToken();
      await user.save({ validateBeforeSave: false });
      
      // Създаваме URL за ресет
      // За продукция, сменете URL с адрес на вашия frontend
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;
      
      // Изпращаме имейл
      await emailService.sendPasswordResetEmail({
        email: user.email,
        subject: 'Заявка за възстановяване на парола',
        resetUrl
      });
      
      return { message: 'If that email exists, we have sent a password reset link' };
    } catch (error) {
      // Ако възникне грешка, изчистваме токена за да предотвратим проблеми
      if (email) {
        const user = await User.findOne({ email });
        if (user) {
          user.resetPasswordToken = undefined;
          user.resetPasswordExpire = undefined;
          await user.save({ validateBeforeSave: false });
        }
      }
      
      console.error('Password reset error:', error);
      throw new AppError('Could not send password reset email. Please try again later.', 500);
    }
  },
  
  /**
   * Reset password with token
   * @param {String} token - Reset token
   * @param {String} password - New password
   * @returns {Promise<Object>} Success message
   */
  async resetPassword(token, password) {
    try {
      // Хешираме токена за сравнение със съхранения хеш
      const resetPasswordToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      
      // Намираме потребител с валиден токен, който не е изтекъл
      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
      });
      
      if (!user) {
        throw new AppError('Invalid or expired password reset token', 400);
      }
      
      // Задаваме новата парола и изчистваме токен полетата
      user.password = password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      
      await user.save();
      
      return { message: 'Password has been reset successfully' };
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError('Could not reset password. Please try again.', 500);
    }
  }
};

module.exports = authService;