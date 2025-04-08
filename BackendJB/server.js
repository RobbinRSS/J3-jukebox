// NOTE added sequelizize for migrations

const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const app = express();
app.use(cors());

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "jukebox",
});

app.get("/", (re, res) => {
  return res.json("From backend side");
});

// query to users || localhost:8081/users
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// query to users || localhost:8081/songs
app.get("/songs", (req, res) => {
  const sql = "SELECT * FROM songs";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// NOTE localhost:8081
app.listen(8081, () => {
  console.log("listening");
});
