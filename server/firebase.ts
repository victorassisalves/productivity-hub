import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp as initializeClientApp } from 'firebase/app';
import { getAuth as getClientAuth } from 'firebase/auth';

// Firebase Admin configuration using service account from environment variable
const adminConfig = {
  credential: cert(
    // Parse the JSON service account string from environment variable
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}')
  ),
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
let db: Firestore;

try {
  // Initialize Firebase Admin only once
  if (!global.firebaseAdminApp) {
    // Debug service account
    console.log('Firebase Admin Config:', JSON.stringify({
      projectId: process.env.FIREBASE_PROJECT_ID,
      serviceAccountProvided: !!process.env.FIREBASE_SERVICE_ACCOUNT
    }));
    
    // Initialize with service account credentials
    global.firebaseAdminApp = initializeApp(adminConfig);
    console.log('Firebase Admin initialized successfully');
  }
  
  app = global.firebaseAdminApp;
  adminAuth = getAuth(app);
  db = getFirestore(app);
  
  // Test Firestore connection
  db.collection('test').get()
    .then(() => console.log('Firestore connection test successful'))
    .catch(err => console.error('Firestore connection test failed:', err));
    
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
  console.error('Error details:', JSON.stringify(error));
  throw error;
}

// Also initialize client app for auth verification
let clientApp;
if (!global.firebaseClientApp) {
  global.firebaseClientApp = initializeClientApp(clientConfig);
}
clientApp = global.firebaseClientApp;
const auth = getClientAuth(clientApp);

console.log('Firebase and Firestore initialized successfully');

export { app, db, adminAuth, auth };