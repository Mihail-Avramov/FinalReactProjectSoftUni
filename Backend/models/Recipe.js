const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    trim: true,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  ingredients: [{
    type: String,
    required: true,
    trim: true
  }],
  instructions: [{
    type: String,
    required: true,
    trim: true
  }],
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String
    }
  }],
  category: {
    type: String,
    required: [true, 'Please provide a category'],
    enum: ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'beverage', 'other']
  },
  preparationTime: {
    type: Number,
    required: [true, 'Please provide preparation time'],
    min: [1, 'Preparation time must be at least 1 minute']
  },
  difficulty: {
    type: String,
    required: [true, 'Please provide difficulty level'],
    enum: ['easy', 'medium', 'hard']
  },
  servings: {
    type: Number,
    required: [true, 'Please provide number of servings'],
    min: [1, 'Servings must be at least 1']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipe must have an author']
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for comments
RecipeSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'recipe'
});

// Pre-save hook to update the updatedAt field
RecipeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Recipe', RecipeSchema);