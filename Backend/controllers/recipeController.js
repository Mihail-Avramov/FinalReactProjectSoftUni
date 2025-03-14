// In your recipe controller:
const imageService = require('../services/imageService');

exports.createRecipe = async (req, res, next) => {
  try {
    const recipeData = req.body;
    
    // Handle images if included in request
    if (req.files && req.files.length > 0) {
      // Upload images to Cloudinary
      const uploadedImages = await Promise.all(
        req.files.map(file => {
          // Convert buffer to base64 string for Cloudinary
          const b64 = Buffer.from(file.buffer).toString('base64');
          const dataURI = `data:${file.mimetype};base64,${b64}`;
          return imageService.uploadImage(dataURI);
        })
      );
      
      // Add images to recipe data
      recipeData.images = uploadedImages;
    }
    
    // Create recipe
    const recipe = await recipeService.createRecipe(recipeData, req.user._id);
    
    res.status(201).json({
      success: true,
      data: recipe
    });
  } catch (error) {
    next(error);
  }
};