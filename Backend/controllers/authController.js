const authService = require('../services/authService');
const imageService = require('../services/imageService');
const { AppError } = require('../middleware/errorHandler');

/**
 * Register a new user
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, username, firstName, lastName } = req.body;
    
    // Handle profile picture if provided
    let profilePicture;
    if (req.file) {
      // Convert buffer to base64 string for Cloudinary
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${b64}`;
      
      // Upload to Cloudinary with profile picture optimizations
      const uploadResult = await imageService.uploadProfilePicture(dataURI);
      profilePicture = uploadResult.url;
    }
    
    // Register user
    const result = await authService.registerUser({
      email, 
      password, 
      username, 
      firstName, 
      lastName,
      profilePicture // This will be undefined if no file was uploaded
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
 * Get current logged in user
 */
exports.getCurrentUser = async (req, res, next) => {
  try {
    // req.user is already set by the protect middleware
    res.status(200).json({
      success: true,
      data: {
        _id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        profilePicture: req.user.profilePicture
      }
    });
  } catch (error) {
    next(error);
  }
};