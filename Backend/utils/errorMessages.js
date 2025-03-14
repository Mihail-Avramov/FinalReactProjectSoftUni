/**
 * Centralized error messages for consistent user experience
 */
const errorMessages = {
  auth: {
    invalidCredentials: 'The email or password you entered is incorrect',
    accountExists: 'An account with this email already exists',
    usernameTaken: 'This username is already taken, please choose another one',
    tokenExpired: 'Your login session has expired. Please sign in again',
    unauthorized: 'You must be logged in to perform this action',
    notAuthorized: 'You are not authorized to perform this action',
    invalidToken: 'Your login token is invalid. Please sign in again'
  },
  validation: {
    invalidEmail: 'Please enter a valid email address',
    weakPassword: 'Your password must be at least 6 characters long',
    requiredField: field => `${field} is required`,
    invalidUsername: 'Username must contain only letters, numbers and underscores',
    missingCredentials: 'Both email and password are required',
    passwordRequired: 'Password is required',
    passwordEmpty: 'Password cannot be empty',
    currentAndNewPasswordRequired: 'Current password and new password are required',
    invalidObjectId: 'The provided ID is not valid',
    usernameMinLength: 'Username must be at least 3 characters',
    nameRequired: field => `${field} cannot be empty`,
    invalidId: 'Invalid ID format',
    validationFailed: 'Please correct the errors in the form',
    passwordSame: 'New password must be different from your current password'
  },
  user: {
    notFound: 'The requested user account could not be found',
    deleteError: 'Unable to delete your account. Please try again',
    identifierRequired: 'Username or ID is required to find a user',
    incorrectPassword: 'The current password you entered is incorrect',
    usernameExists: 'Username already taken, please choose another one'
  },
  image: {
    uploadFailed: 'Your image could not be uploaded. Please try again',
    invalidFormat: 'Please upload an image in JPG, PNG or WebP format',
    tooLarge: 'Your image is too large. Maximum size is 5MB',
    noImageUploaded: 'No image was uploaded. Please select an image first'
  },
  recipe: {
    notFound: 'The requested recipe could not be found',
    unauthorized: 'You do not have permission to modify this recipe',
    deleteError: 'Unable to delete the recipe. Please try again',
    titleRequired: 'Recipe title is required',
    titleTooLong: maxLength => `Title cannot exceed ${maxLength} characters`,
    descriptionRequired: 'Recipe description is required',
    descriptionTooLong: maxLength => `Description cannot exceed ${maxLength} characters`,
    ingredientsRequired: 'At least one ingredient is required',
    tooManyIngredients: max => `Cannot have more than ${max} ingredients`,
    instructionsRequired: 'At least one instruction step is required',
    tooManyInstructions: max => `Cannot have more than ${max} instruction steps`,
    categoryRequired: 'Category is required',
    invalidCategory: 'Invalid category selected',
    preparationTimeInvalid: 'Preparation time must be at least 1 minute',
    difficultyRequired: 'Difficulty level is required',
    invalidDifficulty: 'Invalid difficulty level',
    servingsInvalid: 'Servings must be at least 1'
  },
  comment: {
    notFound: 'Comment not found',
    unauthorized: 'You do not have permission to modify this comment',
    contentRequired: 'Comment text is required',
    contentEmpty: 'Comment cannot be empty',
    contentTooLong: 'Comment cannot exceed 500 characters'
  },
  server: {
    internalError: 'Something went wrong on our end. Please try again later',
    rateLimitExceeded: 'Too many requests. Please try again later',
    maintenanceMode: 'The service is temporarily down for maintenance'
  }
};

module.exports = errorMessages;