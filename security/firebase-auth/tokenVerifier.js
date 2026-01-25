/**
 * Firebase Token Verifier
 * Backend token verification using Firebase Admin SDK
 */

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let adminInitialized = false;

function initializeFirebaseAdmin() {
    if (adminInitialized) {
        return;
    }

    try {
        // Try to load service account key file
        const serviceAccount = require('./serviceAccountKey.json');
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✓ Firebase Admin initialized with service account');
        adminInitialized = true;
    } catch (error) {
        // Fallback to environment variables for cloud deployment
        if (process.env.FIREBASE_ADMIN_PROJECT_ID) {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
                    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
                    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')
                })
            });
            console.log('✓ Firebase Admin initialized with environment variables');
            adminInitialized = true;
        } else {
            console.warn('⚠ Firebase Admin not initialized - running in DEV mode');
            console.warn('  Add serviceAccountKey.json or set FIREBASE_ADMIN_* env variables');
        }
    }
}

// Initialize on module load
initializeFirebaseAdmin();

async function verifyIdToken(idToken) {
    if (!adminInitialized) {
        console.warn('WARNING: Firebase Admin not initialized - allowing dev access');
        return { valid: true, uid: 'dev-user', email: 'dev@example.com' };
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        return {
            valid: true,
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
            role: decodedToken.role || 'viewer',
            expiresAt: decodedToken.exp
        };
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return { valid: false, error: error.message };
    }
}

async function createCustomToken(uid, claims = {}) {
    if (!adminInitialized) {
        throw new Error('Firebase Admin not initialized');
    }
    return await admin.auth().createCustomToken(uid, claims);
}

async function revokeRefreshTokens(uid) {
    if (!adminInitialized) {
        throw new Error('Firebase Admin not initialized');
    }
    await admin.auth().revokeRefreshTokens(uid);
    console.log(`Revoked refresh tokens for user: ${uid}`);
}

async function getUserByEmail(email) {
    if (!adminInitialized) {
        throw new Error('Firebase Admin not initialized');
    }
    return await admin.auth().getUserByEmail(email);
}

async function setCustomUserClaims(uid, claims) {
    if (!adminInitialized) {
        throw new Error('Firebase Admin not initialized');
    }
    await admin.auth().setCustomUserClaims(uid, claims);
    console.log(`Set custom claims for ${uid}:`, claims);
}

function validateRequestOrigin(req) {
    // TODO: Implement firewall-like request validation
    const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:3001',
        process.env.ALLOWED_ORIGIN
    ].filter(Boolean);
    
    const origin = req.headers.origin || req.headers.referer;
    
    if (!origin) {
        console.warn('Request without origin header');
        return true; // Allow for development
    }
    
    return allowedOrigins.some(allowed => origin.startsWith(allowed));
}

module.exports = {
    verifyIdToken,
    createCustomToken,
    revokeRefreshTokens,
    getUserByEmail,
    setCustomUserClaims,
    validateRequestOrigin
};
