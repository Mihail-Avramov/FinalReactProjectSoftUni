const authService = require('../services/authService');

/**
 * Register a new user
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, username, firstName, lastName } = req.body;
    
    // Изпращаме целия req.file, без да качваме снимката тук
    const result = await authService.registerUser({
      email, 
      password, 
      username, 
      firstName, 
      lastName,
      profileImage: req.file // Изпращаме raw файла, а не URL
    });
    
    res.status(201).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const result = await authService.loginUser(email, password);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Logout user
 */
exports.logout = async (req, res, next) => {
  try {
    // Extract token from header
    const token = req.headers.authorization.split(' ')[1];
    
    // Call logout service
    const result = await authService.logoutUser(token);
    
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verify token and return user data
 */
exports.verifyToken = async (req, res, next) => {
  try {
    // User is already verified by protect middleware
    res.status(200).json({
      success: true,
      data: {
        user: {
          _id: req.user._id,
          username: req.user.username,
          email: req.user.email,
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          profilePicture: req.user.profilePicture,
          bio: req.user.bio
        }
      }
    });
  } catch (error) {
    next(error);
  }
};