import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import "./App.css";

function MainContent() {
  // data is de waarde, setData gebruik je als functie om de data aan te passen
  const [data, setData] = useState([]);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const { isLoggedIn, userInfo } = useContext(AuthContext);

  const [temporaryPlaylist, setTemporaryPlaylist] = useState(() => {
    const stored = sessionStorage.getItem("tempPlaylist");
    return stored ? JSON.parse(stored) : null;
  });

  fetch("http://localhost:8081/check-session", {
    method: "GET",
    credentials: "include",
  });

  function createPlaylist() {
    if (!isLoggedIn) {
      if (temporaryPlaylist) {
        alert(
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
      // console.log("Tijdelijke playlist aangemaakt");
    } else if (isLoggedIn) {
      const userId = userInfo.id;
      const name = prompt("Naam voor je playlist");

      fetch("http://localhost:8081/createplaylist", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, userId }),
      });
    }
  }

  function addSongToUserPlaylist(song, playlist) {
    // console.log(song, playlist);

    fetch("http://localhost:8081/addsongtoplaylist", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ playlistId: playlist, song }),
    }).catch((err) => console.error(err));
  }

  useEffect(() => {
    if (isLoggedIn && userInfo?.id) {
      fetch("http://localhost:8081/getuserplaylists", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: userInfo.id }),
      })
        .then((res) => res.json())
        .then((data) => {
          setUserPlaylists(data);
        })
        .catch((err) => console.error("Error fetching playlists:", err));
    }
  }, [isLoggedIn, userInfo]); // alleen uitvoeren wanneer login state of user ID veranderd

  function addSongToTempPlaylist(song) {
    if (isLoggedIn) return;
    if (!temporaryPlaylist) alert("Je hebt geen playlist");

    // check voor dubbelen
    const duplicatesSong = temporaryPlaylist.songs.some(
      (s) => s.id === song.id
    );
    if (duplicatesSong) {
      alert("song is already in playlist");
      return;
    }

    // de playlist vervangen met een "nieuwe"
    const updatedPlaylist = {
      ...temporaryPlaylist,
      songs: [...temporaryPlaylist.songs, song],
    };

    alert(`${song.song_title} is added to your playlist`);
    setTemporaryPlaylist(updatedPlaylist);
    sessionStorage.setItem("tempPlaylist", JSON.stringify(updatedPlaylist));
  }

  useEffect(() => {
    fetch("http://localhost:8081/songs", {
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
              <div key={song.id} id="song">
                {song.song_title}{" "}
                <span id="duration-song">
                  {(song.song_duration / 60).toFixed(2)} min
                </span>
                {isLoggedIn ? (
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
        </div>
        {isLoggedIn ? (
          <>
            {userPlaylists.length > 0 ? (
              <>
                {userPlaylists.map((playlist) => (
                  <Link to={`/playlist/${playlist.id}`}>{playlist.name}</Link>
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
    </>
  );
}

export default MainContent;
