import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import "./App.css";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function PlaylistPage() {
  const { isLoggedIn } = useContext(AuthContext);
  const [tempPlaylistSongs, setTempPlaylistSongs] = useState([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("tempPlaylist");
    if (stored) {
      const parsed = JSON.parse(stored);
      setTempPlaylistSongs(parsed.songs || []);
    }
  }, []);

  function removeFromPlaylist(id) {
    const updatedSongs = tempPlaylistSongs.filter((song) => song.id !== id);

    setTempPlaylistSongs(updatedSongs);

    const stored = sessionStorage.getItem("tempPlaylist");
    if (stored) {
      const parsed = JSON.parse(stored);
      parsed.songs = updatedSongs;
      sessionStorage.setItem("tempPlaylist", JSON.stringify(parsed));
    }
  }

  // krijg de id parameter
  if (isLoggedIn) {
    const [playlistSongs, setPlaylistSongs] = useState([]);
    const { id: playlistId } = useParams();

    useEffect(() => {
      if (!playlistId) return;

      fetch("http://localhost:8081/getsongfromplaylist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ playlistId }),
      })
        .then((res) => res.json())
        .then((data) => {
          console.log(data);
          setPlaylistSongs(data);
        })
        .catch((err) => console.log(err));
    }, [playlistId]);

    // console.log(playlistSongs);
  }

  return (
    <main>
      <h2>Temporary Playlist</h2>
      <section id="all-songs">
        {!isLoggedIn ? (
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
        ) : (
          <p>cool</p>
        )}
      </section>
      <div id="return-main">
        <Link to="/">Return to main page</Link>
      </div>
    </main>
  );
}

export default PlaylistPage;
