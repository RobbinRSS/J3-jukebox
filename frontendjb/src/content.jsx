import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer } from "react-toastify";
import { showSuccess, showError } from "./toastifyMsg.jsx";
import "./App.css";

function MainContent() {
  // data is de waarde, setData gebruik je als functie om de data aan te passen
  const [data, setData] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);

  const { userSession, setUserSession } = useContext(AuthContext);

  const [temporaryPlaylist, setTemporaryPlaylist] = useState(() => {
    const stored = sessionStorage.getItem("tempPlaylist");
    return stored ? JSON.parse(stored) : null;
  });

  function createPlaylist() {
    if (!userSession.loggedIn) {
      if (temporaryPlaylist) {
        showError(
          "You already have a playlist made, create a account to make more playlists"
        );
        return;
      }
      const newTempPlaylist = {
        name: "Temporary playlist",
        songs: [],
      };
      setTemporaryPlaylist(newTempPlaylist); // async (beschikbaar bij de volgende render)
      sessionStorage.setItem("tempPlaylist", JSON.stringify(newTempPlaylist)); // direct toegevoegd, dus de waarde van temporaryPlaylist word niet null
      showSuccess(
        "Temporary playlist is created, if you want to make more playlists create a account"
      );
    } else if (userSession.loggedIn) {
      const userId = userSession.user.id;
      const name = prompt("Naam voor je playlist");

      fetch(`${import.meta.env.VITE_API_URL}/createplaylist`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, userId }),
      }).then(() => {
        showSuccess("Playlist is created");
        fetchUserPlaylists();
      });
    }
  }

  function addSongToUserPlaylist(song, playlist) {
    // console.log(song, playlist);

    fetch(`${import.meta.env.VITE_API_URL}/addsongtoplaylist`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ playlistId: playlist, song }),
    })
      .then(() => showSuccess("Song added to your playlist!"))
      .catch((err) => {
        showError("Something went wrong!");
        console.error(err);
      });
  }

  function fetchUserPlaylists() {
    if (userSession.loggedIn && userSession.user?.id) {
      fetch(`${import.meta.env.VITE_API_URL}/getuserplaylists`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userSession.user.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          setUserPlaylists(data);
        })
        .catch((err) => console.error("Error fetching playlists:", err));
    }
  }

  // initializeren van de eerste lading
  useEffect(() => {
    if (userSession.loggedIn && userSession.user?.id) {
      fetchUserPlaylists();
    }
  }, [userSession.loggedIn]);

  function addSongToTempPlaylist(song) {
    if (userSession.loggedIn) return;
    if (!temporaryPlaylist) showError("Je hebt geen playlist");

    // check voor dubbelen
    const duplicatesSong = temporaryPlaylist.songs.some(
      (s) => s.id === song.id
    );
    if (duplicatesSong) {
      showError("song is already in playlist");
      return;
    }

    // de playlist vervangen met een "nieuwe"
    const updatedPlaylist = {
      ...temporaryPlaylist,
      songs: [...temporaryPlaylist.songs, song],
    };

    showSuccess(`${song.song_title} is added to your playlist`);
    setTemporaryPlaylist(updatedPlaylist);
    sessionStorage.setItem("tempPlaylist", JSON.stringify(updatedPlaylist));
  }

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/songs`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <>
      {/* NOTE main gaat de design importeren van alle songs of als gebruiker op playlist klikt dan playlist */}
      <main>
        <h2>Songs</h2>
        <section id="all-songs">
          {/* NOTE function dat meteen word uitgevoerd, om het te renderen */}
          {data.length > 0 ? (
            data.map((song) => (
              <Link key={song.id} id="song" to={`/song/${song.id}`}>
                {song.song_title}{" "}
                <span id="duration-song">
                  {(song.song_duration / 60).toFixed(2)} min
                </span>
                {userSession.loggedIn ? (
                  <select
                    id="dropdown"
                    onChange={(e) => {
                      if (e.target.value !== "") {
                        console.log(e, song);
                        addSongToUserPlaylist(song, e.target.value);
                        e.target.value = ""; // reset dropdown
                      }
                    }}
                  >
                    <option value=""></option>
                    {userPlaylists.map((playlist) => (
                      <option key={playlist.id} value={playlist.id}>
                        {playlist.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <button
                    id="add-to-playlist"
                    onClick={() => addSongToTempPlaylist(song)}
                  >
                    <FontAwesomeIcon icon={faThumbsUp} />
                  </button>
                )}
              </Link>
            ))
          ) : (
            <p>No songs available</p>
          )}
        </section>
      </main>

      {/* NOTE alle href krijgen url parameters  */}
      <section id="all-playlists">
        <div id="header-playlists">
          <h2>Playlists</h2>
          <button onClick={createPlaylist}>Create playlist</button>
        </div>
        {userSession.loggedIn ? (
          <>
            {userPlaylists.length > 0 ? (
              <>
                {userPlaylists.map((playlist) => (
                  <Link key={playlist.id} to={`/playlist/${playlist.id}`}>
                    {playlist.name}
                  </Link>
                ))}
              </>
            ) : (
              <p>You have no playlists available</p>
            )}
          </>
        ) : (
          <>
            {temporaryPlaylist ? (
              <Link to="/temp-playlist">{temporaryPlaylist.name}</Link>
            ) : (
              <p>
                Warning: User is not logged in, you can only create a temporary
                playlist
              </p>
            )}
          </>
        )}
      </section>
      <ToastContainer />
    </>
  );
}

export default MainContent;
