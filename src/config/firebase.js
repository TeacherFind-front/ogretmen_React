import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

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

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Setup Providers
export const googleProvider = new GoogleAuthProvider();

export default app;
