const cloudinary = require('../config/cloudinary');
const { AppError } = require('../middleware/errorHandler');
const config = require('../config/default');

const imageService = {
  /**
   * Upload an image to Cloudinary
   * @param {String|Buffer} image - Base64 encoded image or file buffer
   * @param {String} folder - Cloudinary folder to store image in
   * @param {Boolean} isProfilePicture - Whether the image is a profile picture
   * @returns {Promise<Object>} Uploaded image details
   */
  async uploadImage(image, folder = 'recipes', isProfilePicture = false) {
    try {
      let transformationOptions;
      
      if (isProfilePicture) {
        // Transformations specific for profile pictures
        transformationOptions = [
          { width: 300, height: 300, crop: "fill", gravity: "face" }, // Reduced to 300x300
          { quality: "auto:good" },                                   // Good quality (better compression)
          { fetch_format: "auto" }                                    // Auto format (WebP when supported)
        ];
      } else {
        // Default transformations for recipe images
        transformationOptions = [
          { width: 1200, crop: "limit" },                             // Resize large images
          { quality: "auto" },                                        // Automatic quality optimization
          { fetch_format: "auto" }                                    // Automatic format selection
        ];
      }
      
      const result = await cloudinary.uploader.upload(image, {
        folder: `culinary_corner/${folder}`,
        resource_type: 'auto',
        allowed_formats: config.upload.images.allowedFormats,
        transformation: transformationOptions
      });
      
      return {
        url: result.secure_url,
        publicId: result.public_id
      };
    } catch (error) {
      console.error('Image upload failed:', error);
      throw new AppError('Failed to upload image', 500);
    }
  },
  
  /**
   * Upload a profile picture with optimizations
   * @param {String|Buffer} image - Base64 encoded image or file buffer
   * @returns {Promise<Object>} Uploaded image details
   */
  async uploadProfilePicture(image) {
    return this.uploadImage(image, 'users', true);
  },
  
  /**
   * Upload multiple images to Cloudinary
   * @param {Array<String|Buffer>} images - Array of base64 encoded images or file buffers
   * @param {String} folder - Cloudinary folder to store images in
   * @returns {Promise<Array<Object>>} Uploaded images details
   */
  async uploadMultipleImages(images, folder = 'recipes') {
    if (!images || !images.length) return [];
    
    const uploadPromises = images.map(image => this.uploadImage(image, folder));
    return Promise.all(uploadPromises);
  },
  
  /**
   * Delete an image from Cloudinary
   * @param {String} publicId - Public ID of the image to delete
   * @returns {Promise<Boolean>} Success indicator
   */
  async deleteImage(publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
      return true;
    } catch (error) {
      console.error('Image deletion failed:', error);
      return false;
    }
  }
};

module.exports = imageService;