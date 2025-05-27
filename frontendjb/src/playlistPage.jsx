import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import "./App.css";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function PlaylistPage() {
  const { isLoggedIn } = useContext(AuthContext);
  const [tempPlaylistSongs, setTempPlaylistSongs] = useState([]);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const [userSession, setUserSession] = useState({});
  const { id: playlistId } = useParams();

  useEffect(() => {
    fetch("http://localhost:8081/check-session", {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.loggedIn) {
          setUserSession(data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("tempPlaylist");
    if (stored) {
      const parsed = JSON.parse(stored);
      setTempPlaylistSongs(parsed.songs || []);
    }
  }, []);

  function removeFromPlaylist(id) {
    if (!userSession.loggedIn) {
      const updatedSongs = tempPlaylistSongs.filter((song) => song.id !== id);

      setTempPlaylistSongs(updatedSongs);

      const stored = sessionStorage.getItem("tempPlaylist");
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.songs = updatedSongs;
        sessionStorage.setItem("tempPlaylist", JSON.stringify(parsed));
      }
    } else if (userSession.loggedIn) {
      fetch("http://localhost:8081/deletesongfromplaylist", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playlistId: Number(playlistId), songId: id }),
      })
        .then((res) => {
          if (!res.ok) throw new Error("Failed to delete song from playlist");
          // Verwijder uit state zodat UI direct updatet
          setPlaylistSongs((prev) => prev.filter((song) => song.songId !== id));
        })
        .catch((err) => console.error("Error removing song:", err));
    }
  }

  // inladen van songs, ingelogde gebruiker //
  useEffect(() => {
    if (!userSession.loggedIn || !playlistId) return;

    fetch("http://localhost:8081/getsongfromplaylist", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ playlistId: Number(playlistId) }),
    })
      .then((res) => res.json())
      .then((data) => {
        setPlaylistSongs(data);
      })
      .catch((err) => console.log(err));
  }, [userSession.loggedIn, playlistId]);
  //

  // console.log(playlistSongs);

  return (
    <main>
      {!userSession.loggedIn ? (
        <h2>Temporary Playlist</h2>
      ) : (
        <h2>Your playlist</h2>
      )}
      <section id="all-songs">
        {!userSession.loggedIn ? (
          tempPlaylistSongs.length > 0 ? (
            tempPlaylistSongs.map((song) => (
              <div key={song.id} id="song">
                {song.song_title}{" "}
                <span id="duration-song">
                  {(song.song_duration / 60).toFixed(2)} min
                </span>
                <button
                  id="remove-from-playlist"
                  onClick={() => removeFromPlaylist(song.id)}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))
          ) : (
            <h2>No songs in playlist</h2>
          )
        ) : playlistSongs.length > 0 ? (
          playlistSongs.map((song) => (
            <div key={song.id} id="song">
              {song.songTitle}{" "}
              <span id="duration-song">
                {(song.songDuration / 60).toFixed(2)} min
              </span>
              <button
                id="remove-from-playlist"
                onClick={() => removeFromPlaylist(song.songId)}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          ))
        ) : (
          <h2>No songs in playlist</h2>
        )}
      </section>
      <div id="return-main">
        <Link to="/">Return to main page</Link>
      </div>
    </main>
  );
}

export default PlaylistPage;
