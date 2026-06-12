import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCB62Hh5H-UtI58-KoRg4MgCFJ5R1ZaxtA",
  authDomain: "ozeldersvip-51804.firebaseapp.com",
  projectId: "ozeldersvip-51804",
  storageBucket: "ozeldersvip-51804.firebasestorage.app",
  messagingSenderId: "116388426739",
  appId: "1:116388426739:web:0c145282f0aa0ac6751886"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Analytics (Only if supported in the current environment e.g. browser)
let analytics = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});
export { analytics };

// Setup Providers
export const googleProvider = new GoogleAuthProvider();

export default app;
