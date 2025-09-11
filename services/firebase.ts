import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

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

// We need to declare these variables to be exported, but they will be initialized conditionally.
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Validate that the essential Firebase config variables are present.
// The app cannot function without these.
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.appId
) {
  // Throw a clear error for the developer to see in the console.
  // This is more helpful than the cryptic error from the Firebase SDK.
  throw new Error(
    "Firebase configuration is missing or incomplete. Please ensure all required FIREBASE_* environment variables are set. The application cannot start without them."
  );
} else {
  // All essential config is present, initialize Firebase.
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
}

export { auth, db };
