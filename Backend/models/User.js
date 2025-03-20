const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const config = require('../config/default');
const crypto = require('crypto'); // Добавете този import

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false // Don't include password in queries by default
  },
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters']
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  profilePicture: {
    type: String,
    default: config.user.defaultProfilePicture
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot be more than 200 characters']
  },
  favoriteRecipes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

UserSchema.index({ favoriteRecipes: 1 });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Добавете метод за генериране на токен за ресет на паролата
UserSchema.methods.generatePasswordResetToken = function() {
  // Генерираме случаен token
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Хешираме токена преди съхранение в базата данни (за сигурност)
  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
    
  // Токенът ще изтече след 30 минути
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
  
  // Връщаме оригиналния токен (не хешираната версия)
  return resetToken;
};

// Добавяне на метод за генериране на верификационен токен
UserSchema.methods.generateVerificationToken = function() {
  // Генериране на случаен токен
  const verificationToken = crypto.randomBytes(32).toString('hex');
  
  // Хеширане на токена за съхранение в базата данни
  this.verificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');
    
  // Токенът ще изтече след 24 часа
  this.verificationTokenExpire = Date.now() + 24 * 60 * 60 * 1000;
  
  return verificationToken;
};

module.exports = mongoose.model('User', UserSchema);