/**
 * Backend Error Handling Middleware & Utilities
 */

class AppError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';
  
  // Log error
  logError(err, req);
  
  // Don't leak error details in production
  const isDev = process.env.NODE_ENV === 'development';
  
  res.status(statusCode).json({
    success: false,
    error: {
      message: isDev ? message : getPublicErrorMessage(statusCode),
      ...(isDev && { stack: err.stack }),
      ...(isDev && { details: err })
    },
    timestamp: new Date().toISOString()
  });
}

// Not found handler
function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.method} ${req.path} not found`
    },
    timestamp: new Date().toISOString()
  });
}

// Async handler wrapper to catch errors
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// Logger
function logError(err, req = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level: 'ERROR',
    message: err.message,
    stack: err.stack,
    ...(req && {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get('user-agent')
    })
  };

  console.error(JSON.stringify(logEntry, null, 2));
  
  // TODO: Send to external logging service (Sentry, CloudWatch, etc.)
}

function logInfo(message, data = {}) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'INFO',
    message,
    ...data
  }));
}

function logWarning(message, data = {}) {
  console.warn(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'WARN',
    message,
    ...data
  }));
}

function getPublicErrorMessage(statusCode) {
  const messages = {
    400: 'Bad request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not found',
    429: 'Too many requests',
    500: 'Internal server error',
    503: 'Service unavailable'
  };
  return messages[statusCode] || 'An error occurred';
}

module.exports = {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  logError,
  logInfo,
  logWarning
};
