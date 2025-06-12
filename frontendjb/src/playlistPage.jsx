// imports //
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import "./App.css";
import { Link, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPen } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer } from "react-toastify";
import { showSuccess, showError } from "./toastifyMsg.jsx";
//

function PlaylistPage() {
  // variables //
  const [tempPlaylistSongs, setTempPlaylistSongs] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [playlistSongs, setPlaylistSongs] = useState([]);
  const { userSession, setUserSession, formatDuration } =
    useContext(AuthContext);
  const { id: playlistId } = useParams();
  const [totalDurationPlaylist, setTotalDuration] = useState();
  //

  // get songs from temporary playlist //
  useEffect(() => {
    const stored = sessionStorage.getItem("tempPlaylist");
    if (stored) {
      const parsed = JSON.parse(stored);
      setTempPlaylistSongs(parsed.songs || []);
    }
  }, []);
  //

  // function for changing playlist //
  function changePlaylistName() {
    const newName = prompt("Change name");
    if (!newName) return;
    fetch(`${import.meta.env.VITE_API_URL}/updateplaylist`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ playlistId, newName }),
    })
      .then((res) => res.json())
      .then((res) => {
        window.location.reload();
      })
      .catch((err) => {
        console.error(err);
        showError("Something went wrong");
      });
  }
  //

  // get the total duration from all songs in the playlist //
  function totalDuration() {
    if (!userSession.loggedIn) {
      setTotalDuration(
        tempPlaylistSongs.reduce((acc, song) => acc + song.song_duration, 0)
      );
    } else {
      setTotalDuration(
        playlistSongs.reduce((acc, song) => acc + song.songDuration, 0)
      );
    }
  }

  useEffect(() => {
    totalDuration();
  }, [tempPlaylistSongs, playlistSongs, userSession]);
  //

  // function for removing songs //
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
  //

  // get playlist info //
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
  //

  // loading in songs from logged in user //
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

  return (
    <main>
      {!userSession.loggedIn ? (
        <h2>Temporary Playlist</h2>
      ) : (
        <h2>
          {playlist.name}{" "}
          <button id="edit-playlist" onClick={changePlaylistName}>
            <FontAwesomeIcon icon={faPen}></FontAwesomeIcon>
          </button>
        </h2>
      )}
      <section id="all-songs">
        {!userSession.loggedIn ? (
          tempPlaylistSongs.length > 0 ? (
            tempPlaylistSongs.map((song) => (
              <div key={song.id} id="song">
                {song.song_title}{" "}
                <span id="duration-song">
                  {formatDuration(song.song_duration)} min
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
                {formatDuration(song.songDuration)} min
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
      <div id="playlist-duration">
        Total duration: {formatDuration(totalDurationPlaylist)} min
      </div>
      <div id="return-main">
        <Link to="/">Return to main page</Link>
      </div>
      <ToastContainer />
    </main>
  );
}

export default PlaylistPage;
