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
      let uploadOptions = {
        folder: `culinary_corner/${folder}`,
        resource_type: 'auto',
        allowed_formats: config.upload.images.allowedFormats
      };
      
      if (isProfilePicture) {
        uploadOptions.transformation = [
          { width: 300, height: 300, crop: "fill", gravity: "face" },
          { quality: "auto:good" },
          { fetch_format: "auto" }
        ];
      } else {
        uploadOptions.transformation = [
          { width: 1000, height: 1000, crop: "fill", gravity: "auto" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
          { flags: "progressive" },
          { improve: "indoor" },
          { effect: "saturation:10" }
        ];
        
        // Eager трансформации за предварително генерирани версии
        uploadOptions.eager = [
          // Карта с рецепта (средна миниатюра)
          { 
            width: 500, height: 500, 
            crop: "fill", gravity: "auto", 
            quality: "auto" 
          },
          // Списъчна миниатюра (малка)
          { 
            width: 200, height: 200, 
            crop: "fill", gravity: "auto", 
            quality: "auto:eco" 
          }
        ];
      }
      
      const result = await cloudinary.uploader.upload(image, uploadOptions);
      
      // Връщане на разширен обект с всички URL адреси
      return {
        url: result.secure_url,
        publicId: result.public_id,
        ...(result.eager && result.eager.length >= 2 && {
          card: result.eager[0].secure_url,
          thumbnail: result.eager[1].secure_url,
        })
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
   * @param {Array<String|Buffer|Object>} images - Array of base64 encoded images, file buffers, or multer file objects
   * @param {String} folder - Cloudinary folder to store images in
   * @returns {Promise<Array<Object>>} Uploaded images details
   */
  async uploadMultipleImages(images, folder = 'recipes') {
    if (!images || !images.length) return [];
    
    const uploadPromises = images.map(image => {
      // Case 1: Multer file object with buffer and mimetype
      if (image && typeof image === 'object' && image.buffer && image.mimetype) {
        const b64 = Buffer.from(image.buffer).toString('base64');
        const dataURI = `data:${image.mimetype};base64,${b64}`;
        return this.uploadImage(dataURI, folder);
      }
      
      // Case 2: Already formatted image (base64/url/etc)
      return this.uploadImage(image, folder);
    });
    
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
        return true;
      }
      
      console.log(`Deleting image with public ID: ${publicId} from URL: ${imageUrl}`);
      
      await cloudinary.uploader.destroy(publicId);
      return true;
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