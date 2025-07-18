// NOTE added sequelizize for migrations

const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const cors = require("cors");
const { json } = require("sequelize");

// for sessions with server side //
const session = require("express-session");
const dotenv = require("dotenv");
dotenv.config();
//

const app = express();

app.use(express.json()); // Zorg ervoor dat de body goed wordt geparsed

// frontend toegang //
app.use(
  cors({
    origin: "http://localhost:5173", // frontend mag toegang krijgen
    credentials: true,
  })
);
//

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// server side session for storing user info //
app.use(
  session({
    secret: process.env.SESSION_SECRET, // secret wordt gebruikt om de sessies veilig te ondertekenen
    resave: false, // alleen opslaan als er iets gewijzigd is in de sessie.
    saveUninitialized: false, //  geen lege sessies aanmaken.
    cookie: { secure: false, sameSite: "lax" }, // geen HTTPS nodig (je zet dit op true als je met HTTPS werkt).
  })
);

// check for session //
app.get("/check-session", (req, res) => {
  if (req.session.user) {
    return res.json({ loggedIn: true, user: req.session.user });
  } else {
    return res.json({ loggedIn: false });
  }
});
//

// logout user //
app.get("/log-out", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Session destroy error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    return res.status(200).json({ message: "User is logged out" });
  });
});

//

//

app.get("/", (re, res) => {
  return res.json("From backend side");
});

// query for signing in //
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

      req.session.user = {
        id: user.id,
        username: user.name,
      };

      return res.status(200).json({
        message: "User logged in successfully",
        id: user.id,
        username: user.name,
      });
    });
  });
});
//

// query for signing up //
app.post("/signup", (req, res) => {
  const { username, password } = req.body;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.json(err);

    const insertSql =
      "INSERT INTO users (name, password, createdAt) VALUES (?, ?, ?)";
    const createdAt = new Date();

    db.query(
      insertSql,
      [username, hashedPassword, createdAt],
      (err, result) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Account creation failed", error: err });

        // Nieuwe gebruiker ophalen met SELECT
        const selectSql = "SELECT * FROM users WHERE name = ?";
        db.query(selectSql, [username], (err, data) => {
          if (err) return res.status(500).json(err);

          const user = data[0];
          req.session.user = {
            id: user.id,
            username: user.name,
          };

          return res.status(201).json({
            message: "Account successfully created",
            id: user.id,
            username: user.name,
          });
        });
      }
    );
  });
});
//

// add song to playlist//
app.post("/addsongtoplaylist", (req, res) => {
  const { playlistId, song } = req.body;

  const checkSql = `
    SELECT * FROM playlist_songs 
    WHERE playlistId = ? AND songId = ?
  `;

  db.query(checkSql, [playlistId, song.id], (err, result) => {
    if (err) {
      console.error("Check error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (result.length > 0) {
      return res.status(409).json({ message: "Song already in playlist" });
    }

    // PAS HIER NAAR BINNEN verplaatsen
    const sql = `
      INSERT INTO playlist_songs (playlistId, songId, createdAt) 
      VALUES (?, ?, ?)
    `;

    const createdAt = new Date();
    const songId = song.id;

    db.query(sql, [playlistId, songId, createdAt], (err, result) => {
      if (err) {
        console.error("Insert error:", err);
        return res.status(500).json({ message: "Failed to add song" });
      }
      return res.status(201).json({ message: "Added song to playlist" });
    });
  });
});
//

// get all songs from selected playlist //
app.post("/getsongfromplaylist", (req, res) => {
  const { playlistId } = req.body;
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Not authorized" });
  }

  // Check of de playlist bij deze gebruiker hoort
  const checkOwnershipSql =
    "SELECT * FROM playlists WHERE id = ? AND userId = ?";
  db.query(checkOwnershipSql, [playlistId, userId], (err, ownershipResult) => {
    if (err) return res.status(500).json({ message: "Something went wrong" });
    if (ownershipResult.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Haal alle songIds op uit playlist_songs
    const songIdQuery =
      "SELECT songId FROM playlist_songs WHERE playlistId = ?";
    db.query(songIdQuery, [playlistId], (err, result) => {
      if (err) return res.status(500).json({ message: "Error loading songs" });
      if (result.length === 0) return res.status(200).json([]);

      // Haal alle song-details op via een IN-clausule (geen join!)
      const songIds = result.map((row) => row.songId);
      const placeholders = songIds.map(() => "?").join(",");
      const songsQuery = `SELECT * FROM songs WHERE id IN (${placeholders})`;

      db.query(songsQuery, songIds, (err, songs) => {
        if (err)
          return res.status(500).json({ message: "Failed to get songs" });
        return res.status(200).json(songs);
      });
    });
  });
});
//

// deleting song from playlist //
app.post("/deletesongfromplaylist", (req, res) => {
  const { playlistId, songId } = req.body;

  const sql = "DELETE FROM playlist_songs WHERE playlistId = ? AND songId = ?";

  db.query(sql, [playlistId, songId], (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result);
  });
});
//

// query for creating playlist//
app.post("/createplaylist", (req, res) => {
  const { name, userId } = req.body;

  const sql =
    "INSERT INTO playlists (name, userId, createdAt) VALUES (?, ?, ?)";

  const createdAt = new Date();

  db.query(sql, [name, userId, createdAt], (err, result) => {
    if (err) return res.json(err);
    return res
      .status(201)
      .json({ message: "Playlist created", playlistId: result.insertId });
  });
});
//

// get playlists that are connected to the logged in users id //
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
//

// get info from selected playlist //
app.post("/getselectedplaylist", (req, res) => {
  const { playlistId } = req.body;
  const userId = req.session.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Not authorized" });
  }

  const sql = "SELECT * FROM playlists WHERE id = ? AND userId = ?";

  db.query(sql, [playlistId, userId], (err, result) => {
    if (err) return res.status(500).json({ message: "Something went wrong!" });
    if (result.length === 0) {
      return res.status(403).json({ message: "Access denied" });
    }
    return res.status(200).json(result);
  });
});
//

// query for updating the playlist name //
app.post("/updateplaylist", (req, res) => {
  const { playlistId, newName } = req.body;

  const sql = "UPDATE playlists SET name = ? WHERE id = ?";

  db.query(sql, [newName, playlistId], (err, result) => {
    if (err) {
      console.error("Error updating playlist:", err);
      return res.status(500).json({ message: "Something went wrong!" });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Playlist not found" });
    }

    res.json({ message: "Playlist updated successfully" });
  });
});
//

// query to users || localhost:8081/songs
app.get("/songs", (req, res) => {
  const sql = "SELECT * FROM songs";
  db.query(sql, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});
//

// query for getting filtered songs //
app.post("/getfilteredsongs", (req, res) => {
  const { genre } = req.body;

  const sql = "SELECT * FROM songs WHERE genre = ?";

  db.query(sql, [genre], (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result);
  });
});

//

// get info from selected song //
app.post("/getselectedsong", (req, res) => {
  const { id } = req.body;
  const sql = "SELECT * FROM songs WHERE id = ?";

  db.query(sql, [id], (err, result) => {
    if (err) return res.json(err);
    return res.status(200).json(result);
  });
});
//

// NOTE localhost:8081
app.listen(8081, () => {
  console.log("listening");
});
