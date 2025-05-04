import { useEffect, useState, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import "./App.css";

function MainContent() {
  // data is de waarde, setData gebruik je als functie om de data aan te passen
  const [data, setData] = useState([]);
  const { isLoggedIn } = useContext(AuthContext);

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
                  <button id="add-to-playlist">+</button>
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
        <h2>Playlists</h2>
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
          <p>
            Warning: User is not logged in, you can only create a temporary
            playlist
          </p>
        )}
      </section>
    </>
  );
}

export default MainContent;
