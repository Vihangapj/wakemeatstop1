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
// 2. Click the gear icon next to "Project Overview" and select "Project settings".
// 3. In the "General" tab, scroll down to the "Your apps" section.
// 4. If you haven't created a web app, click the "</>" icon to create one.
// 5. Find your web app and click on "Firebase SDK snippet", then select "Config".
// 6. Copy the entire `firebaseConfig` object and paste it below.
//
// NOTE on `appId`: The placeholder `appId` below (`G-...`) is a Google Analytics
// Measurement ID, NOT a Firebase App ID. A real Firebase web `appId` looks like
// `1:1234567890:web:abcdef1234567890`. If your config has a `G-` ID, you have
// copied the wrong thing.
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

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };