const express = require("express");
const app = express();

const db=require("./config/db");


app.use(express.urlencoded());

app.use(express.json())
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("welcome back");
});

app.get("/myself", (req, res) => {
  res.send("My name is sujal and i am a software developer");
});



   


app.listen(PORT, (err) => {
  if (err) {
    console.log("Server Error", err);
  } else {
    console.log("Server is Listening on ", PORT);
  }
});
