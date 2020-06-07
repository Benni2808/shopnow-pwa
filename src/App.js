import React, { useEffect, useState } from "react";
import "./App.css";
import ItemList from "./components/ItemList";
import AddItem from "./components/AddItem";
import { Container, Button } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import firebase from "./firebase";
import { useSnackbar } from "notistack";

const styles = (theme) => ({
  container: {
    textAlign: "center",
  },
  button: {
    margin: "10px",
  },
});
function App({ classes }) {
  const [tokens, setTokens] = useState([]);
  const [deferredPrompt, setDeferredPrompt] = useState(undefined);
  const { enqueueSnackbar } = useSnackbar();

  window.addEventListener("beforeinstallprompt", function (e) {
    console.log("beforeinstallprompt Event fired");
    e.preventDefault();
    // Stash the event so it can be triggered later.
    setDeferredPrompt(e);
    return false;
  });

  useEffect(() => {
    firebase
      .firestore()
      .collection("tokens")
      .onSnapshot((snapshot) => {
        const newTokens = [];
        snapshot.forEach((doc) => {
          const token = doc.data();
          newTokens.push(token);
        });
        setTokens(newTokens);
      });
  });

  async function handleSendMessage(content) {
    tokens.forEach((token) => {
      if (token.enabled) {
        const fetchOptions = {
          notification: {
            text: content,
            title: content,
          },
          projectId: "shopnow-24f98",
          to: token.token,
        };

        fetch("https://fcm.googleapis.com/fcm/send", {
          mode: "cors",
          method: "POST",
          headers: {
            Authorization:
              "key=AAAAYaF0hW4:APA91bH0OAsLV6PN5-V89rkPr0KDW0bYqxCC52FoU6vPxN9twmLaC5jl7LliEvOJF74GxVJa-vXfdGLikq6O06nwFXjYH6COrP4b1c6yUYSXgvRdDRqJj3H-K5RYlDeG3l5j7WUzIRbg",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(fetchOptions),
        })
          .then((response) => response.json())
          .then((data) => console.log(data));
      }
    });
  }

  const handlePushPermission = async () => {
    const messaging = firebase.messaging();
    const userToken = await messaging.getToken();

    let isEnabled;
    tokens.forEach((token) => {
      if (token.token === userToken) {
        isEnabled = token.enabled;
        return;
      }
    });
    if (isEnabled) {
      await firebase
        .firestore()
        .collection("tokens")
        .doc(userToken)
        .update({ token: userToken, enabled: false });
      enqueueSnackbar("Push-Benachrichtigungen wurden deaktiviert", {
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
        autoHideDuration: 500,
      });
    } else {
      messaging
        .requestPermission()
        .then(async () => {
          const newToken = await messaging.getToken();
          await firebase
            .firestore()
            .collection("tokens")
            .doc(newToken)
            .set({ token: newToken, enabled: true });
          enqueueSnackbar("Push-Benachrichtigungen wurden aktiviert", {
            anchorOrigin: {
              vertical: "top",
              horizontal: "center",
            },
            autoHideDuration: 500,
          });
        })
        .catch((err) => {
          console.log("Unable to get permission to notify.", err);
        });
      navigator.serviceWorker.addEventListener("message", (message) =>
        console.log(message)
      );
    }
  };

  const handleAddToHomescreen = () => {
    if (deferredPrompt !== undefined) {
      deferredPrompt.prompt();

      // Follow what the user has done with the prompt.
      deferredPrompt.userChoice.then((choiceResult) => {
        console.log(choiceResult.outcome);
        if (choiceResult.outcome === "dismissed") {
          console.log("User cancelled home screen install");
        } else {
          console.log("User added to home screen");
          // We no longer need the prompt.  Clear it up.
          setDeferredPrompt(undefined);
        }
      });
    }
  };

  return (
    <div className="App">
      <Container maxWidth="sm" className={classes.container}>
        <Button
          onClick={handlePushPermission}
          variant="contained"
          color="primary"
          className={classes.button}
        >
          Push Notifications
        </Button>
        <Button
          onClick={handleAddToHomescreen}
          variant="contained"
          className={classes.button}
          color="secondary"
        >
          Add To Homescreen
        </Button>
        <h1>Shop Now</h1>
        <AddItem handleSendMessage={handleSendMessage} />
        <ItemList
          title="Artikel zu kaufen"
          doc="kaufen"
          handleSendMessage={handleSendMessage}
        />
        <ItemList
          title="Gekaufte Artikel"
          doc="gekauft"
          handleSendMessage={handleSendMessage}
        />
      </Container>
    </div>
  );
}

export default withStyles(styles)(App);
