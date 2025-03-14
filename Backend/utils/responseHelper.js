const sendResponse = (res, statusCode, data, message = null) => {
    const response = {
      success: true,
      data
    };
    
    if (message) {
      response.message = message;
    }
    
    res.status(statusCode).json(response);
  };
  
  module.exports = { sendResponse };
  
  // Example usage in controller:
  const { sendResponse } = require('../utils/responseHelper');
  
  exports.updateProfile = async (req, res, next) => {
    try {
      const updatedUser = await userService.updateProfile(userId, updateData);
      sendResponse(res, 200, updatedUser, 'Profile updated successfully');
    } catch (error) {
      next(error);
    }
  };