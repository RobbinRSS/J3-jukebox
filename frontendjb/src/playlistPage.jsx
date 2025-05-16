import { useEffect, useState } from "react";
import "./App.css";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash } from "@fortawesome/free-solid-svg-icons";

function PlaylistPage() {
  const [playlistSongs, setPlaylistSongs] = useState([]);

  useEffect(() => {
    const stored = sessionStorage.getItem("tempPlaylist");
    if (stored) {
      const parsed = JSON.parse(stored);
      setPlaylistSongs(parsed.songs || []);
    }
  }, []);

  //   console.log(playlistSongs);

  return (
    <main>
      <h2>Temporary Playlist</h2>
      <section id="all-songs">
        {(() => {
          if (playlistSongs.length > 0) {
            return playlistSongs.map((song) => (
              <div key={song.id} id="song">
                {song.song_title}{" "}
                <span id="duration-song">
                  {(song.song_duration / 60).toFixed(2)} min
                </span>
                <button id="remove-from-playlist">
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ));
          } else {
            return <h2>No songs in playlist</h2>;
          }
        })()}
      </section>
      <div id="return-main">
        <Link to="/">Return to main page</Link>
      </div>
    </main>
  );
}

export default PlaylistPage;
