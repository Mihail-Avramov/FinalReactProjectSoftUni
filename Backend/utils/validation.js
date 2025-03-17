const { body, param, query, validationResult } = require('express-validator');
const { AppError } = require('../middleware/errorHandler');
const config = require('../config/default');
const errorMessages = require('./errorMessages'); // Fix the path

/**
 * Process validation errors and format them consistently
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  
  // Format validation errors
  const formattedErrors = {};
  errors.array().forEach(error => {
    formattedErrors[error.path || error.param] = error.msg;
  });
  
  // Use the AppError class with centralized message
  return next(new AppError(errorMessages.validation.validationFailed, 422, formattedErrors));
};

/**
 * Registration validation rules
 */
exports.registerValidation = [
  body('email')
    .exists().withMessage(errorMessages.validation.requiredField('Email'))
    .if(body('email').exists())
    .isEmail().withMessage(errorMessages.validation.invalidEmail),
  body('password')
    .exists().withMessage(errorMessages.validation.requiredField('Password'))
    .if(body('password').exists())
    .isLength({ min: 6 }).withMessage(errorMessages.validation.weakPassword),
  body('username')
    .exists().withMessage(errorMessages.validation.requiredField('Username'))
    .if(body('username').exists())
    .isLength({ min: 3 }).withMessage(errorMessages.validation.usernameMinLength)
    .matches(/^[a-zA-Z0-9_]+$/).withMessage(errorMessages.validation.invalidUsername),
  body('firstName')
    .exists().withMessage(errorMessages.validation.requiredField('First name'))
    .if(body('firstName').exists())
    .notEmpty().withMessage(errorMessages.validation.nameRequired('First name')),
  body('lastName')
    .exists().withMessage(errorMessages.validation.requiredField('Last name'))
    .if(body('lastName').exists())
    .notEmpty().withMessage(errorMessages.validation.nameRequired('Last name')),
  
  validate
];

/**
 * Login validation rules
 */
exports.loginValidation = [
  body('email')
    .exists().withMessage(errorMessages.validation.requiredField('Email'))
    .if(body('email').exists())
    .isEmail().withMessage(errorMessages.validation.invalidEmail),
  
  body('password')
    .exists().withMessage(errorMessages.validation.requiredField('Password'))
    .if(body('password').exists())
    .notEmpty().withMessage(errorMessages.validation.passwordEmpty),
  
  validate
];

/**
 * Recipe validation rules
 */
const recipeValidation = [
  body('title')
    .notEmpty().withMessage(errorMessages.recipe.titleRequired)
    .isLength({ max: config.recipe.maxTitleLength })
    .withMessage(errorMessages.recipe.titleTooLong(config.recipe.maxTitleLength)),
  body('description')
    .notEmpty().withMessage(errorMessages.recipe.descriptionRequired)
    .isLength({ max: config.recipe.maxDescriptionLength })
    .withMessage(errorMessages.recipe.descriptionTooLong(config.recipe.maxDescriptionLength)),
  body('ingredients')
    .isArray({ min: 1 }).withMessage(errorMessages.recipe.ingredientsRequired)
    .custom(ingredients => {
      if (ingredients.length > config.recipe.maxIngredientsCount) {
        throw new Error(errorMessages.recipe.tooManyIngredients(config.recipe.maxIngredientsCount));
      }
      return true;
    }),
  body('instructions')
    .isArray({ min: 1 }).withMessage(errorMessages.recipe.instructionsRequired)
    .custom(instructions => {
      if (instructions.length > config.recipe.maxInstructionsCount) {
        throw new Error(errorMessages.recipe.tooManyInstructions(config.recipe.maxInstructionsCount));
      }
      return true;
    }),
  body('category')
    .notEmpty().withMessage(errorMessages.recipe.categoryRequired)
    .isIn(['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'beverage', 'other'])
    .withMessage(errorMessages.recipe.invalidCategory),
  body('preparationTime')
    .isInt({ min: 1 }).withMessage(errorMessages.recipe.preparationTimeInvalid),
  body('difficulty')
    .notEmpty().withMessage(errorMessages.recipe.difficultyRequired)
    .isIn(['easy', 'medium', 'hard']).withMessage(errorMessages.recipe.invalidDifficulty),
  body('servings')
    .isInt({ min: 1 }).withMessage(errorMessages.recipe.servingsInvalid),
  validate
];

/**
 * Comment validation rules
 */
const commentValidation = [
  body('content')
    .notEmpty().withMessage(errorMessages.comment.contentEmpty)
    .isLength({ min: 3 }).withMessage(errorMessages.comment.contentTooShort)
    .isLength({ max: 500 }).withMessage(errorMessages.comment.contentTooLong),
  validate
];

/**
 * ID parameter validation
 */
const idParamValidation = [
  param('id')
    .isMongoId().withMessage(errorMessages.validation.invalidId),
  validate
];

/**
 * Profile update validation rules
 */
exports.profileUpdateValidation = [
  body('username')
    .optional()
    .notEmpty().withMessage(errorMessages.validation.nameRequired('Username')).bail()
    .isLength({ min: 3 }).withMessage(errorMessages.validation.usernameMinLength).bail()
    .matches(/^[a-zA-Z0-9_]+$/).withMessage(errorMessages.validation.invalidUsername),
  
  body('firstName')
    .optional()
    .notEmpty().withMessage(errorMessages.validation.nameRequired('First name')),
  
  body('lastName')
    .optional()
    .notEmpty().withMessage(errorMessages.validation.nameRequired('Last name')),
  
  body('bio')
    .optional()
    .isLength({ max: 200 }).withMessage('Bio cannot be more than 200 characters'),
  
  validate
];

/**
 * Password change validation rules
 */
exports.passwordChangeValidation = [
  body('currentPassword')
    .exists().withMessage(errorMessages.validation.currentAndNewPasswordRequired)
    .notEmpty().withMessage(errorMessages.validation.passwordEmpty),
  
  body('newPassword')
    .exists().withMessage(errorMessages.validation.currentAndNewPasswordRequired)
    .notEmpty().withMessage(errorMessages.validation.passwordEmpty)
    .bail() // Stop validation chain if field is empty
    .isLength({ min: 6 }).withMessage(errorMessages.validation.weakPassword)
    .bail() // Stop validation if length check fails
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error(errorMessages.validation.passwordSame);
      }
      return true;
    }),
  
  validate
];

module.exports = {
  registerValidation: exports.registerValidation,
  loginValidation: exports.loginValidation,
  recipeValidation,
  commentValidation,
  idParamValidation,
  profileUpdateValidation: exports.profileUpdateValidation,
  passwordChangeValidation: exports.passwordChangeValidation
};