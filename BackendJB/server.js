// NOTE added sequelizize for migrations

const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const { json } = require("sequelize");

const app = express();
app.use(cors());
app.use(express.json()); // Zorg ervoor dat de body goed wordt geparsed

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

app.post("/signin", (req, res) => {
  const { username, password } = req.body;

  const sql = "SELECT * FROM users WHERE name = ?";
  db.query(sql, [username], (err, data) => {
    if (err) return res.json(err);
    if (data.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = data[0];
    bcrypt.compare(password, user.password, (err, result) => {
      if (err) return res.json(err);
      if (!result) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      return res.status(200).json({ message: "User logged in successfully" });
    });
  });
});

app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  // Hash the password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.json(err);

    // Insert the new user into the database
    const insertSql =
      "INSERT INTO users (name, password, createdAt) VALUES (?, ?, ?)";
    const createdAt = new Date();
    db.query(
      insertSql,
      [username, hashedPassword, createdAt],
      (err, result) => {
        if (err) return res.json(err);
        return res
          .status(201)
          .json({ message: "Account successfully created" });
      }
    );
  });
});

// add song to playlist
app.post("/addsongtoplaylist", (req, res) => {
  const { playlistId, song } = req.body;

  const sql =
    "INSERT INTO playlist_songs (playlistId, songId, songTitle, songDuration, songGenre, createdAt) VALUES (?, ?, ?, ?, ?, ?)";

  const createdAt = new Date();
  const songId = song.id;
  const songName = song.song_title;
  const songDuration = song.song_duration;
  const songGenre = song.genre;

  db.query(
    sql,
    [playlistId, songId, songName, songDuration, songGenre, createdAt],
    (err, result) => {
      if (err) return res.json(err);
      return res.status(201).json({ message: "Added song to playlist" });
    }
  );
});

app.post("/getsongfromplaylist", (req, res) => {
  const { id } = req.body;

  const sql = "SELECT * FROM playlist_songs WHERE playlistId = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.json(err);
    return res.status(201).json({ message: "songs loaded in" });
  });
});

// query for creating playlist
app.post("/createplaylist", (req, res) => {
  const { name, userId } = req.body;

  const sql =
    "INSERT INTO playlists (name, userId, createdAt) VALUES (?, ?, ?)";

  const createdAt = new Date();

  db.query(sql, [name, userId, createdAt], (err, result) => {
    if (err) return res.json(err);
    return res.status(201).json({ message: "Playlist created" });
  });
});

// get playlists that are connected to the logged in users id
app.post("/getuserplaylists", (req, res) => {
  const { userId } = req.body;

  const sql = "SELECT * FROM playlists WHERE userId = ?";

  db.query(sql, [userId], (err, result) => {
    if (err) return res.json(err);
    if (!result) {
      return res.status(401).json({ message: "Something went wrong" });
    }
    return res.status(200).json(result);
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
