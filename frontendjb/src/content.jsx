import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { Link } from "react-router-dom";
import "./App.css";

function MainContent() {
  // data is de waarde, setData gebruik je als functie om de data aan te passen
  const [data, setData] = useState([]);
  const { isLoggedIn } = useContext(AuthContext);

  const [temporaryPlaylist, setTemporaryPlaylist] = useState(() => {
    const stored = sessionStorage.getItem("tempPlaylist");
    return stored ? JSON.parse(stored) : null;
  });

  function createTempPlaylist() {
    if (temporaryPlaylist) {
      alert(
        "You already have a playlist made, create a account to make more playlists"
      );
      return;
    }
    if (!isLoggedIn) {
      const newTempPlaylist = {
        name: "Temporary playlist",
        songs: [],
      };
      setTemporaryPlaylist(newTempPlaylist); // async (beschikbaar bij de volgende render)
      sessionStorage.setItem("tempPlaylist", JSON.stringify(newTempPlaylist)); // direct toegevoegd, dus de waarde van temporaryPlaylist word niet null
      // console.log("Tijdelijke playlist aangemaakt");
    }
  }

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
    console.log(updatedPlaylist);
    console.log(temporaryPlaylist);
    sessionStorage.setItem("tempPlaylist", JSON.stringify(updatedPlaylist));
  }

  useEffect(() => {
    fetch("http://localhost:8081/songs")
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
          {(() => {
            if (data.length > 0) {
              return data.map((song) => (
                // Key maakt het makkelijker voor react als er iets word aangepast om het sneller te renderen
                <div key={song.id} id="song">
                  {song.song_title}{" "}
                  <span id="duration-song">
                    {(song.song_duration / 60).toFixed(2)} min
                  </span>
                  <button
                    id="add-to-playlist"
                    onClick={() => addSongToTempPlaylist(song)}
                  >
                    +
                  </button>
                </div>
              ));
            } else {
              return <p>No songs available</p>;
            }
          })()}
        </section>
      </main>

      {/* NOTE alle href krijgen url parameters  */}
      <section id="all-playlists">
        <div id="header-playlists">
          <h2>Playlists</h2>
          <button onClick={createTempPlaylist}>Create playlist</button>
        </div>
        {isLoggedIn ? (
          <>
            <a href="#">Temporary playlist</a>
            <a href="#">playlist[.name]</a>
            <a href="#">playlist[.name]</a>
            <a href="#">playlist[.name]</a>
            <a href="#">playlist[.name]</a>
            <a href="#">playlist[.name]</a>
            <a href="#">playlist[.name]</a>
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
