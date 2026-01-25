/**
 * Firebase Client Configuration
 * Initialize Firebase for frontend authentication
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || ''
};

// Check if Firebase is properly configured
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && 
  firebaseConfig.projectId && 
  firebaseConfig.apiKey !== '' && 
  firebaseConfig.projectId !== ''
);

// Initialize Firebase only if configured
let app: FirebaseApp | null = null;
let auth: any = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
}

// Authentication functions
export async function signInWithEmail(email: string, password: string) {
  if (!isFirebaseConfigured || !auth) {
    return { user: null, error: 'Firebase is not configured' };
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

export async function signUpWithEmail(email: string, password: string) {
  if (!isFirebaseConfigured || !auth) {
    return { user: null, error: 'Firebase is not configured' };
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

export async function signInWithGoogle() {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    return { user: null, error: 'Firebase is not configured' };
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { user: result.user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message };
  }
}

export async function signOut() {
  if (!isFirebaseConfigured || !auth) {
    return { error: 'Firebase is not configured' };
  }
  try {
    await firebaseSignOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error: error.message };
  }
}

export function getCurrentUser(): User | null {
  if (!isFirebaseConfigured || !auth) {
    return null;
  }
  return auth.currentUser;
}

export function onAuthChange(callback: (user: User | null) => void) {
  if (!isFirebaseConfigured || !auth) {
    callback(null);
    return () => {}; // Return empty unsubscribe function
  }
  return onAuthStateChanged(auth, callback);
}

export { auth, isFirebaseConfigured };
