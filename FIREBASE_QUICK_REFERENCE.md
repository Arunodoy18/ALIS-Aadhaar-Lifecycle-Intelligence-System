# Firebase Authentication - Quick Reference

## Files Created/Modified

### Frontend
- **`frontend/src/lib/firebase.ts`** - Firebase app initialization
- **`frontend/src/lib/auth.ts`** - Auth utilities (login, signup, Google sign-in, logout)
- **`frontend/src/app/auth/page.js`** - Updated auth UI with Google Sign-In button
- **`frontend/.env.local.example`** - Environment variables template
- **`frontend/package.json`** - Added Firebase package

### Backend
- **`security/firebase-auth/authMiddleware.js`** - Express middleware for authentication
- **`security/firebase-auth/login.js`** - Firebase Admin SDK functions
- **`backend/api/routes/authExamples.js`** - Example API routes with authentication
- **`.env.backend.example`** - Backend environment variables template

### Documentation
- **`FIREBASE_SETUP_GUIDE.md`** - Complete setup and integration guide
- **`FIREBASE_QUICK_REFERENCE.md`** - This file

## Quick Start

### 1. Setup Firebase Project
```bash
# Go to https://console.firebase.google.com
# Create project > Enable Authentication > Get credentials
```

### 2. Configure Frontend
```bash
cd frontend
cp .env.local.example .env.local
# Edit .env.local with your Firebase credentials
```

### 3. Configure Backend
```bash
# Download service account key from Firebase Console
# Save as: serviceAccountKey.json (in root directory)
cp .env.backend.example .env
```

### 4. Run Application
```bash
# Frontend
cd frontend
npm run dev

# Backend (if applicable)
cd backend/api
npm start
```

## API Reference

### Frontend Auth Functions

```typescript
// Import
import { 
  loginWithEmail, 
  signupWithEmail, 
  signInWithGoogle, 
  logout,
  getCurrentUser,
  subscribeToAuthChanges,
  getUserToken
} from '@/lib/auth';

// Login with email
await loginWithEmail('user@example.com', 'password');

// Sign up with email
await signupWithEmail('user@example.com', 'password');

// Google sign-in
await signInWithGoogle();

// Logout
await logout();

// Get current user
const user = getCurrentUser();

// Subscribe to auth changes
const unsubscribe = subscribeToAuthChanges((user) => {
  console.log('Auth state changed:', user);
});

// Get user token for API calls
const token = await getUserToken();
```

### Backend Middleware

```javascript
const { authMiddleware, requireRole, optionalAuth } = require('../security/firebase-auth/authMiddleware');

// Require authentication
app.get('/protected', authMiddleware, (req, res) => {
  console.log('User:', req.user.email);
});

// Require specific role
app.post('/admin', authMiddleware, requireRole(['admin']), (req, res) => {
  // Only admin users can access
});

// Optional authentication
app.get('/public', optionalAuth, (req, res) => {
  if (req.user) {
    // Authenticated user
  } else {
    // Public user
  }
});
```

### Backend User Management

```javascript
const auth = require('../security/firebase-auth/login');

// Create user
const user = await auth.createUser('user@example.com', 'password', 'Name');

// Set role
await auth.setUserRole(user.uid, 'admin');

// Get user
const userRecord = await auth.getUserByEmail('user@example.com');

// Update user
await auth.updateUserProfile(user.uid, { displayName: 'New Name' });

// Verify token
const decoded = await auth.verifyToken(token);

// Delete user
await auth.deleteUser(user.uid);
```

## Environment Variables

### Frontend (.env.local)
```
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
```

### Backend (.env)
```
FIREBASE_PROJECT_ID=xxx
FIREBASE_SERVICE_ACCOUNT_KEY=./serviceAccountKey.json
NODE_ENV=development
PORT=5000
```

## Error Handling

```typescript
try {
  await loginWithEmail(email, password);
} catch (error) {
  console.error(error.message);
  // Handle error
  // Common errors:
  // - "auth/user-not-found"
  // - "auth/wrong-password"
  // - "auth/invalid-email"
  // - "auth/weak-password"
}
```

## Security Checklist

- [ ] Copy `.env.local.example` to `.env.local` (frontend)
- [ ] Add `.env.local` to `.gitignore`
- [ ] Download service account key and save as `serviceAccountKey.json`
- [ ] Add `serviceAccountKey.json` to `.gitignore`
- [ ] Enable Google OAuth in Firebase Console
- [ ] Add authorized domains in Firebase Console
- [ ] Set up Firestore/Realtime Database security rules
- [ ] Enable email verification (optional)
- [ ] Set up password reset emails (optional)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Missing or invalid authorization header" | Ensure token is sent as `Bearer <token>` |
| Google sign-in popup closes immediately | Check authorized domains in Firebase |
| "CORS error" | Enable CORS in backend for frontend URL |
| Token verification fails | Check service account key path and permissions |
| User not persisting after refresh | Ensure browser local storage is enabled |

## Next Features to Implement

1. **Email Verification** - Send verification email to new users
2. **Password Reset** - Allow users to reset forgotten passwords
3. **User Profile** - Store additional user information in Firestore
4. **Social Login** - Add GitHub, Facebook, etc.
5. **Multi-Factor Authentication** - Add 2FA support
6. **Session Management** - Handle token refresh and expiration
7. **User Roles & Permissions** - Fine-grained access control
8. **Audit Logging** - Log authentication events

## Resources

- [Firebase Console](https://console.firebase.google.com)
- [Firebase JavaScript SDK](https://firebase.google.com/docs/web/setup)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Authentication Docs](https://firebase.google.com/docs/auth)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)
