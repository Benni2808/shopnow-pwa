import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/messaging";
const config = {
  apiKey: process.env.REACT_APP_APIKEY,
  authDomain: process.env.REACT_APP_AUTHDOMAIN,
  databaseURL: process.env.REACT_APP_DB,
  projectId: process.env.REACT_APP_PID,
  storageBucket: process.env.REACT_APP_SB,
  messagingSenderId: process.env.REACT_APP_SID,
  appId: process.env.REACT_APP_APPID,
  measurementId: process.env.REACT_APP_MID,
};
firebase.initializeApp(config);

const messaging = firebase.messaging();
messaging.usePublicVapidKey(
  "BKkSzyldwFZQe-O_rmxIajDVr14OxxvmoEgqs1gEgq7MNvgfsgswEqqYqPy0VC3ORz0baGgmuhOIRzYuYD_yDA4"
);

// messaging
//   .requestPermission()
//   .then(() => {
//     console.log("have permission");
//     return messaging.getToken();
//   })
//   .then((token) => {
//     if (token) {
//       sendTokenToServer(token);
//       updateUIForPushEnabled(token);
//     } else {
//       // Show permission request.
//       console.log(
//         "No Instance ID token available. Request permission to generate one."
//       );
//       // Show permission UI.
//       updateUIForPushPermissionRequired();
//       setTokenSentToServer(false);
//     }
//     console.log(token);
//   })
//   .catch((err) => {
//     console.log("error getting token");
//   });

messaging.onMessage((payload) => {
  console.log("onMessage: ", payload);
});

firebase
  .firestore()
  .enablePersistence({ synchronizeTabs: true })
  .catch((err) => {
    if (err.code == "failed-precondition") {
      // Multiple tabs open, persistence can only be enabled
      // in one tab at a a time.
      console.log("multiple tabs open");
    } else if (err.code == "unimplemented") {
      // The current browser does not support all of the
      // features required to enable persistence
      console.log("offline caching not supported");
    }
  });
export const itemCollection = firebase.firestore().collection("shoppingItems");
export const listCollection = firebase
  .firestore()
  .collection("shoppingList")
  .doc("kaufen")
  .collection("zutaten");
export default firebase;
export { messaging };
