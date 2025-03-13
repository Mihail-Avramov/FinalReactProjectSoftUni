module.exports = {
  // Application settings
  app: {
    name: 'CulinaryCorner API',
    version: '1.0.0',
    description: 'Recipe sharing platform API'
  },
  
  // Authentication settings
  auth: {
    jwtExpiry: '7d', // Token valid for 7 days
    jwtCookieExpiry: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    saltRounds: 10 // For bcrypt password hashing
  },
  
  // API settings
  api: {
    pagination: {
      defaultLimit: 10,
      maxLimit: 50
    },
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100 // Maximum requests per windowMs
    }
  },
  
  // Recipe constraints
  recipe: {
    maxTitleLength: 100,
    maxDescriptionLength: 500,
    maxIngredientsCount: 50,
    maxInstructionsCount: 30,
    maxImagesCount: 5
  },
  
  // Upload constraints
  upload: {
    images: {
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
    }
  }
};