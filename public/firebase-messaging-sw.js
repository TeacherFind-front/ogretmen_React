importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.9.0/firebase-messaging-compat.js");

const firebaseConfig = {
  apiKey: "AIzaSyCB62Hh5H-UtI58-KoRg4MgCFJ5R1ZaxtA",
  authDomain: "ozeldersvip-51804.firebaseapp.com",
  projectId: "ozeldersvip-51804",
  storageBucket: "ozeldersvip-51804.firebasestorage.app",
  messagingSenderId: "116388426739",
  appId: "1:116388426739:web:0c145282f0aa0ac6751886"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw.js] Received background message ", payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/vite.svg"
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
