/**
 * Rate Limiting Middleware
 */

const rateLimit = {};

function rateLimiter(options = {}) {
  const {
    windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message = 'Too many requests, please try again later'
  } = options;

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimit[key]) {
      rateLimit[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }
    
    // Reset if window expired
    if (now > rateLimit[key].resetTime) {
      rateLimit[key] = {
        count: 1,
        resetTime: now + windowMs
      };
      return next();
    }
    
    // Increment counter
    rateLimit[key].count++;
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - rateLimit[key].count));
    res.setHeader('X-RateLimit-Reset', new Date(rateLimit[key].resetTime).toISOString());
    
    // Check if limit exceeded
    if (rateLimit[key].count > max) {
      return res.status(429).json({
        success: false,
        error: {
          message,
          retryAfter: Math.ceil((rateLimit[key].resetTime - now) / 1000)
        }
      });
    }
    
    next();
  };
}

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  Object.keys(rateLimit).forEach(key => {
    if (now > rateLimit[key].resetTime) {
      delete rateLimit[key];
    }
  });
}, 60000); // Clean every minute

module.exports = rateLimiter;
