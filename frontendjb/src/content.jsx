// imports //
import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer } from "react-toastify";
import { showSuccess, showError } from "./toastifyMsg.jsx";
import "./App.css";
//

function MainContent() {
  // variables //
  const [data, setData] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const uniqueGenres = [...new Set(data.map((song) => song.genre))];
  const songsToDisplay = filteredSongs.length > 0 ? filteredSongs : data;

  const { userSession, setUserSession, formatDuration } =
    useContext(AuthContext);

  const [temporaryPlaylist, setTemporaryPlaylist] = useState(() => {
    const stored = sessionStorage.getItem("tempPlaylist");
    return stored ? JSON.parse(stored) : null;
  });
  //

  // function for creating a playlist //
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
  //

  // function for adding a song to the selected playlist //
  function addSongToUserPlaylist(song, playlist) {
    fetch(`${import.meta.env.VITE_API_URL}/addsongtoplaylist`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ playlistId: playlist, song }),
    })
      .then((res) => {
        if (res.status === 409) {
          showError("Song was already in playlist");
          return;
        }
        showSuccess("Song added to your playlist!");
      })
      .catch((err) => {
        showError("Something went wrong!");
        console.error(err);
      });
  }
  //

  // function for initializing all the playlists //
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
  //

  // function for getting filtered songs array TODO //
  function fetchFilteredSongs(genre) {
    fetch(`${import.meta.env.VITE_API_URL}/getfilteredsongs`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ genre }),
    })
      .then((res) => res.json())
      .then((data) => setFilteredSongs(data))
      .catch((err) => {
        console.error(err);
        showError("Could not filter songs");
      });
  }

  //

  // function for non logged in users to add a song to their temporary playlist //
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
  //

  // TODO logged in user can migrate the temporary playlist //
  function migrateTempPlaylistToReal() {
    if (!userSession.loggedIn) {
      showError("You must be logged in to migrate your playlist.");
      return;
    }
    if (!temporaryPlaylist || temporaryPlaylist.songs.length === 0) {
      showError("You have no temporary playlist to migrate.");
      return;
    }

    const userId = userSession.user.id;

    // 1. Maak een nieuwe playlist aan voor de gebruiker
    fetch(`${import.meta.env.VITE_API_URL}/createplaylist`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: temporaryPlaylist.name || "Migrated playlist",
        userId,
      }),
    })
      .then((res) => res.json())
      .then((playlistData) => {
        const newPlaylistId = playlistData.playlistId || playlistData.id; // afhankelijk van API response

        // 2. Voeg alle songs uit tijdelijke playlist toe aan deze playlist
        const addSongPromises = temporaryPlaylist.songs.map((song) => {
          return fetch(`${import.meta.env.VITE_API_URL}/addsongtoplaylist`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              playlistId: newPlaylistId,
              song,
            }),
          });
        });

        //  Wacht totdat alle fetch calls voor songs toevoegen klaar zijn fucking cool trouwens dat dit een ding is
        return Promise.all(addSongPromises).then(() => newPlaylistId);
      })
      .then((newPlaylistId) => {
        // 3. Clear tijdelijke playlist en update user playlists
        sessionStorage.removeItem("tempPlaylist");
        setTemporaryPlaylist(null);
        showSuccess("Temporary playlist migrated to your account!");
        fetchUserPlaylists();
      })
      .catch((err) => {
        console.error("Migration error:", err);
        showError("Failed to migrate temporary playlist.");
      });
  }
  //

  // initialize to get all songs //
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/songs`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.log(err));
  }, []);
  //

  return (
    <>
      {/* NOTE main gaat de design importeren van alle songs of als gebruiker op playlist klikt dan playlist */}
      <main>
        <div id="start-container">
          <h2>Songs</h2>
          <select
            id="dropdown"
            onChange={(e) => {
              if (e.target.value !== "") {
                fetchFilteredSongs(e.target.value);
              } else if (e.target.value === "") {
                setFilteredSongs([]);
              }
            }}
          >
            <option value=""></option>
            {uniqueGenres.map((genre) => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>
        <section id="all-songs">
          {/* NOTE function dat meteen word uitgevoerd, om het te renderen */}
          {songsToDisplay.length > 0 ? (
            songsToDisplay.map((song) => (
              <div key={song.id} id="song">
                <Link to={`/song/${song.id}`}>{song.song_title} </Link>
                <span id="duration-song">
                  {formatDuration(song.song_duration)} min
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
              </div>
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
          {userSession.loggedIn &&
            temporaryPlaylist &&
            temporaryPlaylist.songs.length > 0 && (
              <button onClick={migrateTempPlaylistToReal}>
                Migrate Temporary Playlist to My Account
              </button>
            )}
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
