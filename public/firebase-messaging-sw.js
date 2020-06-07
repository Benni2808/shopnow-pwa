// // Give the service worker access to Firebase Messaging.
// // Note that you can only use Firebase Messaging here, other Firebase libraries
// // are not available in the service worker.
importScripts("https://www.gstatic.com/firebasejs/7.14.0/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/7.14.0/firebase-messaging.js"
);

// // Initialize the Firebase app in the service worker by passing in
// // your app's Firebase config object.
// // https://firebase.google.com/docs/web/setup#config-object
firebase.initializeApp({
  apiKey: "AIzaSyBw1XuTl1EVMvx-V4X3J4g3X1R_-k-mQQQ",
  authDomain: "shopnow-24f98.firebaseapp.com",
  databaseURL: "https://shopnow-24f98.firebaseio.com",
  projectId: "shopnow-24f98",
  storageBucket: "shopnow-24f98.appspot.com",
  messagingSenderId: "419320595822",
  appId: "1:419320595822:web:ad68db161d2699cf802d7f",
  measurementId: "G-DRZ7L0773T",
});

// // Retrieve an instance of Firebase Messaging so that it can handle background
// // messages.
const messaging = firebase.messaging.isSupported()
  ? firebase.messaging()
  : null;

if (messaging) {
  messaging.setBackgroundMessageHandler(function (payload) {
    const promiseChain = clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((windowClients) => {
        for (let i = 0; i < windowClients.length; i++) {
          const windowClient = windowClients[i];
          windowClient.postMessage(payload);
        }
      })
      .then(() => {
        return registration.showNotification("my notification title");
      });
    return promiseChain;
  });
  self.addEventListener("notificationclick", function (event) {
    console.log(event);
  });
}
