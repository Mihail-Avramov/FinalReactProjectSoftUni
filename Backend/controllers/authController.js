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