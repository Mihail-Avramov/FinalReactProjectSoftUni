const config = require('../config/default');

/**
 * Extract Cloudinary public ID from an image URL
 * @param {String} url - Cloudinary image URL
 * @returns {String|null} - Cloudinary public ID or null if extraction fails
 */
const extractPublicIdFromUrl = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    // Handle default image case using the config value
    if (url === config.user.defaultProfilePicture || url.includes('default-user')) {
      return null;
    }
    
    // Regular Cloudinary URL: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/filename.jpg
    // Extract 'folder/filename' part
    const regex = /\/upload\/(?:v\d+\/)?(.+?)(?:\.\w+)?$/;
    const match = url.match(regex);
    
    if (match && match[1]) {
      return match[1]; // This is the public ID without version and extension
    }
    
    return null;
  } catch (error) {
    console.error('Failed to extract public ID from URL:', error);
    return null;
  }
};

module.exports = {
  extractPublicIdFromUrl
};