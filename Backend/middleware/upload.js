const multer = require('multer');
const { AppError } = require('./errorHandler');
const config = require('../config/default');
const errorMessages = require('../utils/errorMessages');

// Setup in-memory storage for Multer
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (!file.mimetype.startsWith('image/')) {
    return cb(new AppError(errorMessages.image.invalidFormat, 400), false);
  }
  
  // Check for allowed extensions
  const fileExt = file.originalname.split('.').pop().toLowerCase();
  if (!config.upload.images.allowedFormats.includes(fileExt)) {
    return cb(new AppError(errorMessages.image.invalidFormat, 400), false);
  }
  
  cb(null, true);
};

// Create multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: config.upload.images.maxSize // Max file size (5MB)
  },
  fileFilter
});

// Middleware for single image upload
const uploadSingleImage = upload.single('image');

// Middleware for multiple image upload
const uploadMultipleImages = upload.array('images', config.recipe.maxImagesCount);

// Handle multer errors
const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError(errorMessages.image.tooLarge, 400));
    }
    return next(new AppError(err.message, 400));
  }
  next(err);
};

// Optional image upload - won't return error if no file is uploaded
const optionalImageUpload = (req, res, next) => {
  uploadSingleImage(req, res, (err) => {
    if (err) {
      return handleMulterErrors(err, req, res, next);
    }
    next();
  });
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  optionalImageUpload,
  handleMulterErrors
};