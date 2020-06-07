import React, { useState, useEffect } from "react";
import { TextField, Button } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import Autocomplete from "@material-ui/lab/Autocomplete";
import parse from "autosuggest-highlight/parse";
import match from "autosuggest-highlight/match";
import { itemCollection, listCollection } from "../../firebase";

const styles = (theme) => ({
  form: {
    display: "flex",
    justifyContent: "space-evenly",
    alignItems: "center",
    padding: "20px 0",
  },
  button: {
    height: "50px",
  },
});

const AddItem = ({ classes, handleSendMessage }) => {
  const [item, setItem] = useState("");
  const [items, setItems] = useState([]);

  useEffect(() => {
    itemCollection.onSnapshot((snapshot) => {
      const newItems = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(newItems);
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("add", item);
    // check if item is already in itemCollection
    if (!items.find((doc) => doc.name === item)) {
      console.log("not found");
      await itemCollection.doc(item).set({ name: item });
      await listCollection.doc(item).set({ name: item, amount: 1 });
    } else {
      console.log("found item");

      // check if item already in shoppinglist kaufen
      listCollection
        .where("name", "==", item)
        .get()
        .then(async (querySnapShot) => {
          if (querySnapShot.docs.length > 0) {
            querySnapShot.forEach(async (doc) => {
              await listCollection
                .doc(item)
                .update({ amount: doc.data().amount + 1 });
            });
          } else {
            console.log("not in kaufen list");
            await listCollection.doc(item).set({ name: item, amount: 1 });
          }
        });
    }
    handleSendMessage(`${item} added to list`);
  };
  return (
    <form onSubmit={handleSubmit} autoComplete="on" className={classes.form}>
      <Autocomplete
        id="highlight-autocomplete-search"
        style={{ width: 300 }}
        options={items}
        onInputChange={(e, value) => setItem(value)}
        getOptionLabel={(option) => option.id}
        freeSolo
        renderInput={(params) => (
          <TextField
            {...params}
            label="item-highlights"
            variant="outlined"
            margin="normal"
          />
        )}
        renderOption={(option, { inputValue }) => {
          const matches = match(option.id, inputValue);
          const parts = parse(option.id, matches);
          return (
            <div>
              {parts.map((part, index) => (
                <span
                  key={index}
                  style={{ fontWeight: part.highlight ? 700 : 400 }}
                >
                  {part.text}
                </span>
              ))}
            </div>
          );
        }}
      />
      <Button
        variant="contained"
        color="primary"
        type="submit"
        className={classes.button}
      >
        Hinzufügen
      </Button>
    </form>
  );
};

export default withStyles(styles)(AddItem);
