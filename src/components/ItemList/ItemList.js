import React, { useEffect, useState } from "react";
import { withStyles } from "@material-ui/core/styles";
import firebase from "../../firebase";
import { Paper, Typography, CircularProgress } from "@material-ui/core";
import Item from "../Item/Item";
const styles = (theme) => ({
  container: {
    // border: "solid green 2px",
    marginBottom: "20px",
  },
});
const ItemList = ({ classes, doc, title, handleSendMessage }) => {
  const [items, setItems] = useState([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  useEffect(() => {
    // firebase
    //   .firestore()
    //   .collection("shoppingList")
    //   .doc("kaufen")
    //   .collection("zutaten")
    //   .doc("Butter")
    //   .set({ name: "Butter", amount: 1 });
    firebase
      .firestore()
      .collection("shoppingList")
      .doc(doc)
      .collection("zutaten")
      .onSnapshot((snapshot) => {
        const newItems = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(newItems);
        setIsLoadingItems(false);
      });
  }, []);
  return (
    <Paper className={classes.container} elevation={2}>
      <Typography variant="h4">{title}</Typography>
      {isLoadingItems ? (
        <CircularProgress size={30} />
      ) : (
        <div>
          {items.map((item) => (
            <Item
              key={item.id}
              amount={item.amount}
              id={item.id}
              doc={doc}
              handleSendMessage={handleSendMessage}
            />
          ))}
        </div>
      )}
    </Paper>
  );
};

export default withStyles(styles)(ItemList);
