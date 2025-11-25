/**
 * Firebase Admin SDK Configuration
 *
 * Server-side Firebase authentication and Firestore access.
 * Uses service account credentials from environment variables.
 *
 * SECURITY: Only use this module in server-side contexts (API routes, server components)
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let adminApp: App | undefined;
let adminAuth: Auth | undefined;
let adminDb: Firestore | undefined;

/**
 * Initialize Firebase Admin SDK
 *
 * Uses service account credentials from FIREBASE_SERVICE_ACCOUNT_KEY environment variable.
 * The key should be base64-encoded JSON.
 */
function initializeFirebaseAdmin(): App {
  if (adminApp) {
    return adminApp;
  }

  // Check if already initialized
  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminApp = existingApps[0];
    return adminApp;
  }

  // Get service account from environment
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. ' +
      'Please add your base64-encoded service account JSON to .env.local'
    );
  }

  try {
    // Decode base64 service account
    const serviceAccount = JSON.parse(
      Buffer.from(serviceAccountKey, 'base64').toString('utf-8')
    );

    // Initialize app with service account
    adminApp = initializeApp({
      credential: cert(serviceAccount),
    });

    return adminApp;
  } catch (error) {
    throw new Error(
      `Failed to initialize Firebase Admin SDK: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Get Firebase Admin Auth instance
 * Lazily initializes if needed
 */
export function getAdminAuth(): Auth {
  if (!adminAuth) {
    const app = initializeFirebaseAdmin();
    adminAuth = getAuth(app);
  }
  return adminAuth;
}

/**
 * Get Firebase Admin Firestore instance
 * Lazily initializes if needed
 */
export function getAdminDb(): Firestore {
  if (!adminDb) {
    const app = initializeFirebaseAdmin();
    adminDb = getFirestore(app);
  }
  return adminDb;
}

/**
 * Verify Firebase ID token and return decoded token
 *
 * @param idToken - Firebase ID token from client
 * @returns Decoded token with user information
 * @throws Error if token is invalid or expired
 */
export async function verifyIdToken(idToken: string) {
  const auth = getAdminAuth();
  return await auth.verifyIdToken(idToken);
}
