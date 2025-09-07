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
  apiKey: "AIzaSyB658vYUrbFKUMr2xbfNZwkCjgduaMXyjc",
  authDomain: "wakemeatstop.firebaseapp.com",
  projectId: "wakemeatstop",
  storageBucket: "wakemeatstop.firebasestorage.app",
  messagingSenderId: "213650466318",
  appId: "1:213650466318:web:342c52b46f6b46e5de3e5f",
  measurementId: "G-TZ84GBG6ZZ"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
