import React from "react";
import {
  Typography,
  Card,
  Button,
  CardContent,
  Badge,
  CardActions,
  ButtonGroup,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import {
  Remove,
  Add,
  CheckBoxOutlined,
  CheckBoxOutlineBlankOutlined,
} from "@material-ui/icons";
import firebase from "../../firebase";
import { useSnackbar } from "notistack";

const styles = (theme) => {
  console.log(theme.palette);
  return {
    itemCard: {
      maxWidth: "450px",
      margin: "0 auto 20px auto",
      backgroundColor: theme.palette.primary.main,
    },
    cardContent: {
      display: "flex",
      alignItems: "center",
      padding: "5px 10px !important;",
    },
    ingredient: {
      flexGrow: 1,
      textAlign: "left",
    },
    addButton: {
      color: theme.palette.success.main,
    },
  };
};

const Item = ({ id, amount, classes, doc, handleSendMessage }) => {
  const kaufen = firebase
    .firestore()
    .collection("shoppingList")
    .doc("kaufen")
    .collection("zutaten");
  const gekauft = firebase
    .firestore()
    .collection("shoppingList")
    .doc("gekauft")
    .collection("zutaten");
  const item = firebase
    .firestore()
    .collection("shoppingList")
    .doc(doc)
    .collection("zutaten")
    .doc(id);

  const { enqueueSnackbar } = useSnackbar();
  const handleDecreaseAmount = async () => {
    if (amount - 1 === 0) {
      await item.delete();
      enqueueSnackbar(`${id} removed from list`, {
        anchorOrigin: {
          vertical: "top",
          horizontal: "center",
        },
        autoHideDuration: 1500,
        key: id,
      });
      handleSendMessage(`${id} removed from list`);
    } else {
      await item.set({
        amount: amount - 1,
      });
      handleSendMessage(`amount of ${id} has been reduced to ${amount - 1}`);
    }
  };
  const handleIncreaseAmount = async () => {
    console.log("increase", id, amount + 1);
    await item.set({
      amount: amount + 1,
    });
    handleSendMessage(`amount of ${id} has been increased to ${amount + 1}`);
  };

  const handleBuy = async () => {
    if (doc === "kaufen") {
      console.log("bought item", id);
      // check if item was already bought
      await item.delete();
      gekauft
        .where("name", "==", id)
        .get()
        .then(async (querySnapShot) => {
          console.log(querySnapShot);
          if (querySnapShot.docs.length > 0) {
            querySnapShot.forEach(async (doc) => {
              await gekauft
                .doc(id)
                .update({ amount: doc.data().amount + amount });
            });
          } else {
            await gekauft.doc(id).set({
              name: id,
              amount,
            });
          }
        });

      handleSendMessage(`${id} has been bought`);
      // add item to gekauft
    } else {
      console.log("add item", id);
      // add item to kaufen
      await item.delete();
      await kaufen.doc(id).set({
        name: id,
        amount,
      });
      handleSendMessage(`${id} has been added to the list`);
    }
  };

  return (
    <Card className={classes.itemCard}>
      <CardContent className={classes.cardContent}>
        <div className={classes.ingredient}>
          <Badge color="secondary" badgeContent={amount}>
            <Typography>{id}</Typography>
          </Badge>
        </div>
        <CardActions>
          <ButtonGroup>
            <Button
              size="small"
              variant="contained"
              onClick={handleDecreaseAmount}
              color="secondary"
              disabled={doc === "gekauft"}
            >
              <Remove />
            </Button>
            <Button
              size="small"
              variant="contained"
              className={classes.addButton}
              disabled={doc === "gekauft"}
              onClick={handleIncreaseAmount}
            >
              <Add />
            </Button>
          </ButtonGroup>
          <Button variant="outlined" onClick={handleBuy}>
            {doc === "gekauft" ? (
              <CheckBoxOutlined />
            ) : (
              <CheckBoxOutlineBlankOutlined />
            )}
          </Button>
        </CardActions>
      </CardContent>
    </Card>
  );
};

export default withStyles(styles)(Item);
