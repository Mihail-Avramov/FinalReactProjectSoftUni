const authService = require('../services/authService');
const imageService = require('../services/imageService');
const { AppError } = require('../middleware/errorHandler');
const errorMessages = require('../utils/errorMessages'); // Add this import

/**
 * Register a new user
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, username, firstName, lastName } = req.body;
    
    // Handle profile picture if provided
    let profilePicture;
    if (req.file) {
      try {
        // Convert buffer to base64 string for Cloudinary
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        
        // Upload to Cloudinary with profile picture optimizations
        const uploadResult = await imageService.uploadProfilePicture(dataURI);
        profilePicture = uploadResult.url;
      } catch (error) {
        return next(new AppError(errorMessages.image.uploadFailed, 400));
      }
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