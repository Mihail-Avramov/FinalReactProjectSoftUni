const { body, param, query, validationResult } = require('express-validator');
const config = require('../config/default');

/**
 * Process validation results and return errors if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  const extractedErrors = errors.array().map(err => ({
    [err.param]: err.msg
  }));
  
  return res.status(422).json({
    status: 'fail',
    errors: extractedErrors
  });
};

/**
 * Auth validation rules
 */
const registerValidation = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('username')
    .trim()
    .isLength({ min: 3 }).withMessage('Username must be at least 3 characters long')
    .matches(/^[a-zA-Z0-9_-]+$/).withMessage('Username can only contain letters, numbers, underscores and hyphens'),
  validate
];

const loginValidation = [
  body('email')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  validate
];

/**
 * Recipe validation rules
 */
const recipeValidation = [
  body('title')
    .notEmpty().withMessage('Recipe title is required')
    .isLength({ max: config.recipe.maxTitleLength })
    .withMessage(`Title cannot exceed ${config.recipe.maxTitleLength} characters`),
  body('description')
    .notEmpty().withMessage('Recipe description is required')
    .isLength({ max: config.recipe.maxDescriptionLength })
    .withMessage(`Description cannot exceed ${config.recipe.maxDescriptionLength} characters`),
  body('ingredients')
    .isArray({ min: 1 }).withMessage('At least one ingredient is required')
    .custom(ingredients => {
      if (ingredients.length > config.recipe.maxIngredientsCount) {
        throw new Error(`Cannot have more than ${config.recipe.maxIngredientsCount} ingredients`);
      }
      return true;
    }),
  body('instructions')
    .isArray({ min: 1 }).withMessage('At least one instruction step is required')
    .custom(instructions => {
      if (instructions.length > config.recipe.maxInstructionsCount) {
        throw new Error(`Cannot have more than ${config.recipe.maxInstructionsCount} instruction steps`);
      }
      return true;
    }),
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'beverage', 'other'])
    .withMessage('Invalid category selected'),
  body('preparationTime')
    .isInt({ min: 1 }).withMessage('Preparation time must be at least 1 minute'),
  body('difficulty')
    .notEmpty().withMessage('Difficulty level is required')
    .isIn(['easy', 'medium', 'hard']).withMessage('Invalid difficulty level'),
  body('servings')
    .isInt({ min: 1 }).withMessage('Servings must be at least 1'),
  validate
];

/**
 * Comment validation rules
 */
const commentValidation = [
  body('content')
    .notEmpty().withMessage('Comment cannot be empty')
    .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters'),
  validate
];

/**
 * ID parameter validation
 */
const idParamValidation = [
  param('id')
    .isMongoId().withMessage('Invalid ID format'),
  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  recipeValidation,
  commentValidation,
  idParamValidation
};