import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// =================================================================================
// !!! CRITICAL ACTION REQUIRED !!!
//
// The configuration for Firebase is now loaded from environment variables.
// You must set these variables in your deployment environment for the app to
// function correctly. Authentication will fail until you do this.
//
// Example environment variables:
// FIREBASE_API_KEY="AIzaSy..."
// FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
// FIREBASE_PROJECT_ID="your-project-id"
// FIREBASE_STORAGE_BUCKET="your-project-id.appspot.com"
// FIREBASE_MESSAGING_SENDER_ID="1234567890"
// FIREBASE_APP_ID="1:1234567890:web:abcdef123456"
// FIREBASE_MEASUREMENT_ID="G-ABCDEF123"
//
// ALSO, REMEMBER TO:
// - Enable "Email/Password" as a sign-in provider in Firebase Console > Authentication > Sign-in method.
// - Set up Firestore security rules in Firebase Console > Firestore Database > Rules.
// =================================================================================

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };