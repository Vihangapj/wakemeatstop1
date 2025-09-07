import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// =================================================================================
// !!! CRITICAL ACTION REQUIRED !!!
//
// The configuration below is a placeholder and WILL NOT WORK. You must replace
// these values with your own Firebase project's configuration for the app to
// function correctly. Authentication will fail until you do this.
//
// HOW TO GET YOUR CONFIG:
// 1. Go to your Firebase project: https://console.firebase.google.com/
// 2. Click the gear icon (⚙️) next to "Project Overview" and select "Project settings".
// 3. In the "General" tab, scroll down to the "Your apps" section.
// 4. Find your web app and click on "SDK setup and configuration".
// 5. Select the "Config" option.
// 6. Copy the entire `firebaseConfig` object and PASTE IT HERE.
//
// ALSO, REMEMBER TO:
// - Enable "Email/Password" as a sign-in provider in Firebase Console > Authentication > Sign-in method.
// - Set up Firestore security rules in Firebase Console > Firestore Database > Rules.
// =================================================================================

const firebaseConfig = {
  // PASTE YOUR FIREBASE CONFIG OBJECT HERE
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
