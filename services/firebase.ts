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
  apiKey: "AIzaSyB658vYUrbFKUMr2xbfNZwkCjgduaMXyjc",
  authDomain: "wakemeatstop.firebaseapp.com",
  projectId: "wakemeatstop",
  storageBucket: "wakemeatstop.firebasestorage.app",
  messagingSenderId: "213650466318",
  appId: "1:213650466318:web:342c52b46f6b46e5de3e5f",
  measurementId: "G-TZ84GBG6ZZ"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);

export { auth, db };
