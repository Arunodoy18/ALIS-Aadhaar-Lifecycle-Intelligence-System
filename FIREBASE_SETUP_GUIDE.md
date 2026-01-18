# Firebase Authentication Integration Guide

## Overview
This document explains how to set up Google Firebase authentication for the ALIS application.

## Setup Steps

### 1. Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter your project name (e.g., "ALIS")
4. Follow the setup wizard
5. Enable Google Analytics (optional)

### 2. Enable Authentication Methods
1. In Firebase Console, go to **Authentication** > **Sign-in method**
2. Click on **Email/Password** and enable it
3. Click on **Google** and enable it
4. Add your application URL to the authorized domains

### 3. Get Configuration Credentials

#### For Frontend (.env.local)
1. Go to Firebase Console > Project Settings (gear icon)
2. Copy your Web API credentials:
   - API Key
   - Auth Domain
   - Project ID
   - Storage Bucket
   - Messaging Sender ID
   - App ID

2. Create `.env.local` in the `frontend` directory:
```bash
cp frontend/.env.local.example frontend/.env.local
```

3. Fill in your Firebase credentials in `frontend/.env.local`

#### For Backend (service account key)
1. Go to Firebase Console > Project Settings > **Service Accounts** tab
2. Click **Generate New Private Key**
3. A JSON file will download - rename it to `serviceAccountKey.json`
4. Move it to the backend root directory
5. Create `.env` in the backend/api directory:
```bash
cp .env.backend.example backend/api/.env
```

### 4. Install Dependencies

Frontend (already done):
```bash
cd frontend
npm install firebase
```

Backend (if needed):
```bash
cd backend/api
npm install firebase-admin
```

### 5. Set Up Node.js Environment Variables

Create `backend/api/.env`:
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_SERVICE_ACCOUNT_KEY=../serviceAccountKey.json
```

## Frontend Integration

### Authentication Files

- **`frontend/src/lib/firebase.ts`** - Firebase initialization
- **`frontend/src/lib/auth.ts`** - Authentication utilities
- **`frontend/src/app/auth/page.js`** - Authentication UI (Login/Sign-up with Google)

### Using Authentication in Components

```typescript
import { subscribeToAuthChanges, getCurrentUser, logout } from '@/lib/auth';

export default function MyComponent() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((authUser) => {
      setUser(authUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div>
      {user ? (
        <>
          <p>Welcome, {user.email}</p>
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

### Getting User Token for API Requests

```typescript
import { getUserToken } from '@/lib/auth';

async function fetchProtectedData() {
  const token = await getUserToken();
  
  const response = await fetch('/api/protected-endpoint', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}
```

## Backend Integration

### Using Authentication Middleware

```javascript
const { authMiddleware, requireRole } = require('../security/firebase-auth/authMiddleware');
const express = require('express');

const app = express();

// Protected route - requires authentication
app.get('/api/protected', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// Admin-only route
app.get('/api/admin', authMiddleware, requireRole(['admin']), (req, res) => {
  res.json({ message: 'Admin access granted' });
});
```

### User Management (Server-side)

```javascript
const { createUser, setUserRole, getUserByEmail } = require('../security/firebase-auth/login');

// Create new user
const userRecord = await createUser('user@example.com', 'password123', 'User Name');

// Set user role
await setUserRole(userRecord.uid, 'admin');

// Get user
const user = await getUserByEmail('user@example.com');
```

## Security Considerations

### Frontend
- **Never commit `.env.local`** to version control
- Use `NEXT_PUBLIC_` prefix only for values that are safe to expose
- Keep `serviceAccountKey.json` out of frontend code

### Backend
- **Never commit `serviceAccountKey.json`** to version control
- Add to `.gitignore`:
  ```
  serviceAccountKey.json
  .env
  .env.local
  ```
- Store credentials in environment variables or secure vaults in production

### Firebase Security Rules
Set up appropriate Firestore/Realtime Database security rules:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authenticated users can only read/write their own data
    match /users/{uid} {
      allow read, write: if request.auth.uid == uid;
    }
  }
}
```

## Troubleshooting

### Google Sign-In Not Working
- Ensure authorized domains include your development URL
- Check browser console for CORS errors
- Verify Firebase configuration credentials are correct

### "Missing or invalid authorization header" Error
- Ensure token is being sent in the correct format: `Bearer <token>`
- Check that token hasn't expired
- Verify Firebase Admin SDK is properly initialized

### Firebase Emulator (Development)
To use Firebase local emulator for development:

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Start emulator:
```bash
firebase emulators:start
```

3. Set environment variable:
```
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
```

## Next Steps

1. Implement user profile management (Firestore)
2. Add email verification
3. Implement password reset functionality
4. Set up user roles and permissions
5. Add account deletion functionality

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/start)
