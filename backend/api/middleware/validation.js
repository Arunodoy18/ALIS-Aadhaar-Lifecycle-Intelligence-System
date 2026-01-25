/**
 * Input Validation Middleware
 */

const { AppError } = require('./errorHandler');

// Validate query parameters
function validateQueryParams(allowedParams, requiredParams = []) {
  return (req, res, next) => {
    const queryKeys = Object.keys(req.query);
    
    // Check for unknown parameters
    const unknownParams = queryKeys.filter(key => !allowedParams.includes(key));
    if (unknownParams.length > 0) {
      throw new AppError(400, `Unknown query parameters: ${unknownParams.join(', ')}`);
    }
    
    // Check for required parameters
    const missingParams = requiredParams.filter(param => !queryKeys.includes(param));
    if (missingParams.length > 0) {
      throw new AppError(400, `Missing required parameters: ${missingParams.join(', ')}`);
    }
    
    next();
  };
}

// Sanitize input
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove potential SQL injection patterns
  return input
    .replace(/['";\\]/g, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .trim();
}

// Validate and sanitize district query
function validateDistrictQuery(req, res, next) {
  if (req.query.state) {
    req.query.state = sanitizeInput(req.query.state);
  }
  
  if (req.query.risk) {
    const validRisks = ['Stable', 'Watchlist', 'High Risk'];
    if (!validRisks.includes(req.query.risk)) {
      throw new AppError(400, `Invalid risk value. Must be one of: ${validRisks.join(', ')}`);
    }
  }
  
  if (req.query.limit) {
    const limit = parseInt(req.query.limit);
    if (isNaN(limit) || limit < 1 || limit > 1000) {
      throw new AppError(400, 'Limit must be between 1 and 1000');
    }
    req.query.limit = limit;
  }
  
  if (req.query.offset) {
    const offset = parseInt(req.query.offset);
    if (isNaN(offset) || offset < 0) {
      throw new AppError(400, 'Offset must be a non-negative number');
    }
    req.query.offset = offset;
  }
  
  next();
}

module.exports = {
  validateQueryParams,
  validateDistrictQuery,
  sanitizeInput
};
