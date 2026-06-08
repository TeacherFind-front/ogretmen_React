import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";

// TODO: Replace this config with your actual Firebase project configuration
// Go to Firebase Console -> Project Settings -> General -> Your apps -> Firebase SDK snippet -> Config
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Setup Providers
export const googleProvider = new GoogleAuthProvider();
// You can add custom scopes if needed
// googleProvider.addScope('email');

export const appleProvider = new OAuthProvider('apple.com');
// appleProvider.addScope('email');
// appleProvider.addScope('name');

export default app;
