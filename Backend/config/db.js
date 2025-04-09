const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/culinary_corner';

// Database connection options for better reliability and performance
const options = {
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of default 30s
  socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
};

/**
 * Connect to MongoDB database
 * @returns {Promise<typeof mongoose>} Mongoose connection instance
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, options);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection errors after initial connection
    mongoose.connection.on('error', err => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    // Почистване на изтекли blacklisted токени
    const cleanupExpiredTokens = async () => {
      try {
        const BlacklistedToken = mongoose.model('BlacklistedToken');
        const now = new Date();
        const result = await BlacklistedToken.deleteMany({ expiresAt: { $lt: now } });
        console.log(`Expired tokens cleaned up: ${result.deletedCount} removed`);
      } catch (error) {
        if (error.name !== 'MissingSchemaError') {
          console.error(`Failed to clean up expired tokens: ${error.message}`);
        }
      }
    };

    // Изпълняваме почистването веднъж при стартиране
    await cleanupExpiredTokens();
    
    // Настройваме периодично почистване (на всеки 24 часа)
    setInterval(cleanupExpiredTokens, 24 * 60 * 60 * 1000);

    // Graceful shutdown handling
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to app termination');
      process.exit(0);
    });
    
    return mongoose;
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;