import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// =================================================================================
// IMPORTANT: Replace the placeholder values below with your own Firebase project's
// configuration. You can find this in the Firebase Console:
// Project settings > General > Your apps > Firebase SDK snippet > Config
// =================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyB658vYUrbFKUMr2xbfNZwkCjgduaMXyjc",
  authDomain: "wakemeatstop.firebaseapp.com",
  projectId: "wakemeatstop",
  storageBucket: "wakemeatstop.firebasestorage.app",
  messagingSenderId: "213650466318",
  appId: "G-TZ84GBG6ZZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
