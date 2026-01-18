/**
 * Firebase Authentication Middleware
 * Validates Firebase ID tokens and extracts user information
 * 
 * Usage: app.use(authMiddleware) for protected routes
 */

const admin = require('firebase-admin');

/**
 * Main authentication middleware
 * Validates Firebase ID token from Authorization header
 */
async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                error: 'Unauthorized',
                message: 'Missing or invalid authorization header'
            });
        }
        
        const token = authHeader.split('Bearer ')[1];
        
        // Verify Firebase ID token
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.user = decodedToken;
        next();
        
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(403).json({ 
            error: 'Forbidden',
            message: 'Invalid or expired token'
        });
    }
}

/**
 * Role-based access control middleware
 * Ensures user has one of the required roles
 */
function requireRole(roles) {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    error: 'Unauthorized',
                    message: 'User not authenticated'
                });
            }

            // Get custom claims (roles) from Firebase
            const userRecord = await admin.auth().getUser(req.user.uid);
            const userRole = userRecord.customClaims?.role || 'user';
            
            if (!roles.includes(userRole)) {
                return res.status(403).json({ 
                    error: 'Forbidden',
                    message: 'Insufficient permissions'
                });
            }
            
            req.userRole = userRole;
            next();
        } catch (error) {
            console.error('Role check error:', error);
            return res.status(500).json({ 
                error: 'Internal server error',
                message: 'Failed to verify user role'
            });
        }
    };
}

/**
 * Optional authentication middleware
 * Validates token if present, but doesn't require it
 * Useful for routes that have public content but different behavior for logged-in users
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers.authorization;
    
    if (authHeader) {
        return authMiddleware(req, res, next);
    }
    
    req.user = null;
    next();
}

module.exports = {
    authMiddleware,
    requireRole,
    optionalAuth
};
