const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());

app.get("/", (re, res) => {
  return res.json("From backend side");
});

// NOTE localhost:8081
app.listen(8081, () => {
  console.log("listening");
});
