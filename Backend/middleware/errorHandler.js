/**
 * Custom error handler middleware
 */
class AppError extends Error {
  constructor(message, statusCode, fields = null) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    this.fields = fields;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message = 'Validation failed', statusCode = 422, fields = {}) {
    super(message, statusCode);
    this.fields = fields;
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed', statusCode = 401) {
    super(message, statusCode);
  }
}

class NotFoundError extends AppError {
  constructor(message = 'Resource not found', statusCode = 404) {
    super(message, statusCode);
  }
}

/**
 * Handle mongoose validation errors
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle mongoose cast errors (invalid ID)
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle duplicate key errors
 */
const handleDuplicateFieldsError = (err) => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value.`;
  return new AppError(message, 400);
};

/**
 * Handle JWT errors
 */
const handleJWTError = () => new AppError('Invalid token. Please log in again.', 401);
const handleJWTExpiredError = () => new AppError('Your token has expired. Please log in again.', 401);

/**
 * Error response formatter
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    const response = {
      success: false,
      error: {
        code: err.statusCode,
        message: err.message
      }
    };
    
    // Add fields to response if they exist
    if (err.fields) {
      response.error.fields = err.fields;
    }
    
    return res.status(err.statusCode).json(response);
  }
  
  // Programming or other unknown error: don't leak error details
  console.error('ERROR 💥', err);
  res.status(500).json({
    success: false,
    error: {
      code: 500,
      message: 'Something went wrong'
    }
  });
};

/**
 * Main error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    console.error(`
      ERROR 💥 ${err.message}
      URL: ${req.originalUrl}
      Method: ${req.method}
      Body: ${JSON.stringify(req.body)}
      User: ${req.user?._id || 'unauthenticated'}
      Stack: ${err.stack}
    `);
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.statusCode = err.statusCode || 500;
    error.fields = err.fields; // Preserve any fields from validation

    // Log error for debugging
    console.error('ERROR 💥', err);
    
    // Handle specific error types
    if (err.name === 'CastError') {
      error = handleCastError(err);
    }
    
    if (err.code === 11000) {
      error = handleDuplicateFieldsError(err);
    }
    
    if (err.name === 'ValidationError') {
      error = handleValidationError(err);
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    
    if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredError();
    }
    
    // Use the sendErrorProd function for ALL errors
    sendErrorProd(error, res);
  }
};

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  NotFoundError,
  errorHandler
};