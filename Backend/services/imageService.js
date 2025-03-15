const cloudinary = require('../config/cloudinary');
const { AppError } = require('../middleware/errorHandler');
const config = require('../config/default');
const errorMessages = require('../utils/errorMessages');
const { extractPublicIdFromUrl } = require('../utils/cloudinary');

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
      throw new AppError(errorMessages.image.uploadFailed, 500);
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
   * Delete an image from Cloudinary by URL
   * @param {String} imageUrl - URL of the image to delete
   * @returns {Promise<Boolean>} Success indicator
   */
  async deleteImageByUrl(imageUrl) {
    try {
      if (!imageUrl) return true;
      
      // Skip default images
      if (imageUrl === config.user.defaultProfilePicture) {
        return true;
      }
      
      const publicId = extractPublicIdFromUrl(imageUrl);
      if (!publicId) {
        console.warn('Could not extract public ID from URL:', imageUrl);
        return true; // Skip images without publicId
      }
      
      return await this.deleteImage(publicId);
    } catch (error) {
      console.error('Image deletion by URL failed:', error);
      return false;
    }
  },
  
  /**
   * Delete multiple images using flexible input formats
   * @param {Array<String|Object>} images - Array of URLs, publicIds, or objects with url/publicId
   * @returns {Promise<Boolean>} Success indicator
   */
  async deleteMultipleImages(images) {
    try {
      if (!images || !images.length) return true;
      
      // Process various input formats
      const publicIds = images
        .map(img => {
          // Case 1: Object with publicId property
          if (img && typeof img === 'object' && img.publicId) {
            return img.publicId;
          }
          
          // Case 2: Object with url property
          if (img && typeof img === 'object' && img.url) {
            return extractPublicIdFromUrl(img.url);
          }
          
          // Case 3: URL string
          if (typeof img === 'string' && img.startsWith('http')) {
            // Skip default images
            if (img === config.user.defaultProfilePicture) {
              return null;
            }
            return extractPublicIdFromUrl(img);
          }
          
          // Case 4: Already a publicId string
          return img;
        })
        .filter(Boolean); // Remove null/undefined/false values
      
      if (publicIds.length === 0) return true;
      
      // Call the Cloudinary API
      await cloudinary.api.delete_resources(publicIds);
      return true;
    } catch (error) {
      console.error('Multiple image deletion failed:', error);
      return false;
    }
  }
};

module.exports = imageService;