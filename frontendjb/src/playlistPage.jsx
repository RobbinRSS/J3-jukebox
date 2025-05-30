import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import "./App.css";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer } from "react-toastify";
import { showSuccess, showError } from "./toastifyMsg.jsx";

function PlaylistPage() {
  const [tempPlaylistSongs, setTempPlaylistSongs] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const { userSession, setUserSession } = useContext(AuthContext);
  const { id: playlistId } = useParams();

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
        showSuccess("Song succesfully removed from playlist!");
      }
    } else if (userSession.loggedIn) {
      fetch(`${import.meta.env.VITE_API_URL}/deletesongfromplaylist`, {
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
          showSuccess("Song succesfully removed from playlist!");
        })
        .catch((err) => {
          console.error("Error removing song:", err);
          showError("Something went wrong!");
        });
    }
  }

  // playlist info krijgen
  useEffect(() => {
    if (!userSession.loggedIn || !playlistId) return;

    fetch(`${import.meta.env.VITE_API_URL}/getselectedplaylist`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ playlistId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setPlaylist(data[0]);
      });
  }, [playlistId, userSession.loggedIn]);

  // inladen van songs, ingelogde gebruiker //
  useEffect(() => {
    if (!userSession.loggedIn || !playlistId) return;

    fetch(`${import.meta.env.VITE_API_URL}/getsongfromplaylist`, {
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
        <h2>{playlist.name}</h2>
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
      <ToastContainer />
    </main>
  );
}

export default PlaylistPage;
