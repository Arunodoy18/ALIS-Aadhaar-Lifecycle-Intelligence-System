/**
 * TypeScript types for Firebase Authentication
 */

import { User as FirebaseUser, UserCredential } from 'firebase/auth';

/**
 * Extended user type with custom claims
 */
export interface AuthUser extends FirebaseUser {
  role?: string;
  permissions?: string[];
}

/**
 * Authentication response type
 */
export interface AuthResponse {
  user: FirebaseUser | null;
  token?: string;
  error?: string;
}

/**
 * Login/Signup form data
 */
export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  displayName?: string;
}

/**
 * Auth state type
 */
export type AuthState = {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
};

/**
 * Auth context type
 */
export interface AuthContextType {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  loginWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signupWithEmail: (email: string, password: string) => Promise<UserCredential>;
  signInWithGoogle: () => Promise<UserCredential>;
  logout: () => Promise<void>;
  getUserToken: () => Promise<string | null>;
}

/**
 * Protected route props
 */
export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  fallback?: React.ReactNode;
}

/**
 * User profile type
 */
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}

/**
 * API request config with auth token
 */
export interface AuthenticatedRequestInit extends RequestInit {
  headers: {
    Authorization: `Bearer ${string}`;
    [key: string]: string;
  };
}

/**
 * Backend API response type
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * User creation request (backend)
 */
export interface CreateUserRequest {
  email: string;
  password: string;
  displayName?: string;
}

/**
 * Role assignment request (backend)
 */
export interface SetRoleRequest {
  uid: string;
  role: 'user' | 'admin' | 'analyst' | 'supervisor';
}

/**
 * Available user roles
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  ANALYST = 'analyst',
  SUPERVISOR = 'supervisor'
}

/**
 * Permission types
 */
export enum Permission {
  READ = 'read',
  WRITE = 'write',
  DELETE = 'delete',
  ADMIN = 'admin',
  VIEW_ANALYTICS = 'view_analytics',
  EDIT_USER = 'edit_user',
  VIEW_REPORTS = 'view_reports',
  EXPORT_DATA = 'export_data'
}

/**
 * Login error types
 */
export enum AuthErrorCode {
  INVALID_EMAIL = 'auth/invalid-email',
  USER_NOT_FOUND = 'auth/user-not-found',
  WRONG_PASSWORD = 'auth/wrong-password',
  EMAIL_ALREADY_IN_USE = 'auth/email-already-in-use',
  WEAK_PASSWORD = 'auth/weak-password',
  TOO_MANY_REQUESTS = 'auth/too-many-requests',
  USER_DISABLED = 'auth/user-disabled',
  POPUP_CLOSED = 'auth/popup-closed-by-user',
  INVALID_CREDENTIAL = 'auth/invalid-credential'
}

/**
 * Helper function to get user-friendly error message
 */
export function getErrorMessage(errorCode: string): string {
  const messages: Record<string, string> = {
    [AuthErrorCode.INVALID_EMAIL]: 'Please enter a valid email address',
    [AuthErrorCode.USER_NOT_FOUND]: 'No account found with this email',
    [AuthErrorCode.WRONG_PASSWORD]: 'Incorrect password',
    [AuthErrorCode.EMAIL_ALREADY_IN_USE]: 'This email is already registered',
    [AuthErrorCode.WEAK_PASSWORD]: 'Password is too weak. Use at least 6 characters',
    [AuthErrorCode.TOO_MANY_REQUESTS]: 'Too many login attempts. Please try again later',
    [AuthErrorCode.USER_DISABLED]: 'This account has been disabled',
    [AuthErrorCode.POPUP_CLOSED]: 'Sign-in popup was closed',
    [AuthErrorCode.INVALID_CREDENTIAL]: 'Invalid credentials provided'
  };

  return messages[errorCode] || 'An authentication error occurred';
}
