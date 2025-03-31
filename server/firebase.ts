import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp as initializeClientApp } from 'firebase/app';
import { getAuth as getClientAuth } from 'firebase/auth';

// Firebase Admin configuration
const adminConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  // Use Firebase Web API credentials for server-side access in development
  // This is not best practice for production, but works for development
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: `firebase-adminsdk-${process.env.FIREBASE_PROJECT_ID?.substring(0, 4) || 'test'}@${process.env.FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
    // Use a dummy private key for development
    privateKey: '-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCwYOgL0DNBJm/Q\nsCiRQy7ux8BLdLECG8NHhEjUsQI8WS7LUgjUBDblRvQt4hS1KXAS5H5XUaJGmOZH\nAi4C1N4d/iYiLcQoK/0YxJeFZJfw6q6L69XBbU6SqNfBvH5Nj0eiudBdvpSLsO8W\nDYnK6nQFE+HEQp3GzAxbwIlxuRTKPYNl748dKgiGrW8+XTi4iHd+JgZ4IyF8Qmce\naRhRsB05o8cRM7U+kyp/Ryr+nF9yt3+KQzB6M22IW0PRr5UUQdrtnW7iClya6Txb\nSb+QMt5ol7K1TikOaXYdQYZmRiL2jkZkVkTdUQIgsrF2CyjNxKJgYhbYQJV3WiNi\nf6uoboRvAgMBAAECggEABaLDDbxbFBzR3hEOKtyh0UtHfmWLnJsHDxiJPQNUMCPT\nUQF1BaLIv0kMQI8+SBfDNpReayKr0aLbvZpqQxDzxJYvsCUGXEIFMZnWkdNcEb8N\n3Yzm85K4koF7ZxQ1ZLT5zMQz2U8y2P9/HKpK2jI3LQs/KLgP1cs9LRMuDmVDvV3a\nMilTWLGWQeLnE/AI9jKFBbKkr0Z4vEJbk1JGnNCXZLZ+LK+S2rVOJ4QQmNY+Nppl\n5hQF75TvesOEKYfdAAmj/RqY6Hn4cjv1vvVVQTJIZ9UlOkUaRfbESBPLSLVqAYyA\ndZuW7zliLA725TOCiy3E+I1J73o851qqOKUlfQnUQQKBgQDvkDOQU7apR+GDVR5l\nGRNXE7e0UnNtXXqGUob+SY1P4aozrGzqGbYJIEE1xEjJpv7BmgQvYQYzCUw5LZdY\nDnZPBR8zAkC3g1Y4+nXpU7YLEvVqXzDT3yXkP6ixLJRQT2N3oX3DFcNLfKygiS29\nyOsG1FP6zdSXuO4jIBkHEpQlEQKBgQC8oo0jbZTH5VgoEHfQXZWoUUJf2y4k39Wp\nZ8olUHBCfKJl2zfPzgt+cNLrZQhLmKlKSCCCvCkFtR+GtIa5fOUjGDvBnMFtDDXt\nAuRCYTbGGPxj/GrW/CT3WOVi/pqBTqxOMZgD6g+wAyQUAVGUoh0SbMtiweicdFvk\nn3tSJtqd3wKBgBB98XI37/idIcQa5zFvx7nnzMnMq5Zg2/8Zb+3AT0NRjrMTTaop\nRf86f6VdCiwAWmXQke9jUxTr24cLsz63qHBHZ4h5TR0tGSxtt9aP3bmxGLEPiOXP\n7NwVVtAaHvGQMrzluFxVJFMAXb+wdKGmiCZ5m1yjKjpKNzAeY81HzathAoGABG0f\nLg8M+EThjYvTVCw7yZnJcYJs88MdYUsFxN8UHg9I6BlaQ+JXdlwIUuORSHDoBsUp\n9aPcmxGLewx5D5BuQHLUGKkKtQYVTQQnYKCnahP5k+xY8HSqQNmCVHWsxjR3qsQu\nhV+KNYgn9VWNpxoKTDCJ0uHfLZOgR9RJFZu9hDsCgYBWJ97oQteCFn0uVXDOVaDB\nBqRYEMnw5SJKclsYCGe18lrhQj10JXK9yHzQAYcZon5uVuLQbvYUzjFyRzTDMwTV\nG+lXbTNrHgVQKoT7XdQl0SMlIavn+86eSuCbJ5/npdg8Syu24k8yw7LBb2n6rozC\nHKvpZV4PcjMqmGGLgYEzTw==\n-----END PRIVATE KEY-----\n'
  })
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
    // Initialize with application default credentials
    global.firebaseAdminApp = initializeApp(adminConfig);
    console.log('Firebase Admin initialized successfully');
  }
  
  app = global.firebaseAdminApp;
  adminAuth = getAuth(app);
  db = getFirestore(app);
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
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