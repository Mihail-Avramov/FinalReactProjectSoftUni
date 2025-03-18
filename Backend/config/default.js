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
    },
    // Добавяме секция за кеширане
    caching: {
      trendingRecipes: {
        ttl: 15 * 60 * 1000, // 15 минути в милисекунди
        defaultLimit: 6,    // Количество рецепти по подразбиране
        enabled: true       // Лесно включване/изключване на кеша
      }
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
  },

  // User settings
  user: {
    defaultProfilePicture: 'https://res.cloudinary.com/dt3txyehf/image/upload/v1741894912/culinary_corner/users/p4iv6firgpqxjzufgoeq.png'
  }
};