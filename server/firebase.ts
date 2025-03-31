import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp as initializeClientApp } from 'firebase/app';
import { getAuth as getClientAuth } from 'firebase/auth';

// Firebase Admin configuration
const adminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET
};

// Client-side Firebase configuration
const clientConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase Admin
let app;
let adminAuth;
let db;

try {
  // Initialize with application default credentials
  app = initializeApp(adminConfig);
  adminAuth = getAuth(app);
  db = getFirestore(app);
  console.log('Firebase Admin initialized successfully');
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
  throw error;
}

// Also initialize client app for auth verification
const clientApp = initializeClientApp(clientConfig);
const auth = getClientAuth(clientApp);

export { app, db, adminAuth, auth };