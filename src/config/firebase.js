import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getMessaging, isSupported as isMessagingSupported } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

let app = null;
let auth = null;
let db = null;
let analytics = null;
let messaging = null;

const hasFirebaseConfig =
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId;

try {
  if (hasFirebaseConfig) {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);

    // Initialize Firebase Authentication
    auth = getAuth(app);

    // Initialize Firestore
    db = getFirestore(app);

    // Initialize Analytics
    isAnalyticsSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    });

    // Initialize Firebase Cloud Messaging
    isMessagingSupported().then((supported) => {
      if (supported) {
        messaging = getMessaging(app);
      }
    });
  } else {
    console.warn("Firebase frontend config eksik. Auth, Firestore ve Messaging devre dışı. Lütfen .env dosyasını kontrol edip sunucuyu yeniden başlatın.");
  }
} catch (error) {
  console.error("Firebase başlatılamadı:", error);
}

// Setup Providers
export const googleProvider = new GoogleAuthProvider();

export { app as default, auth, db, analytics, messaging };
