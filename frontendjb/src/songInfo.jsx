import { Link, useParams } from "react-router-dom";
import { AuthContext } from "./AuthContext.jsx";
import { useEffect, useState, useContext } from "react";
import { ToastContainer } from "react-toastify";
import { showError } from "./toastifyMsg.jsx";

function SongInfo() {
  const { id } = useParams();

  const [song, setSong] = useState([]);

  const { formatDuration } = useContext(AuthContext);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/getselectedsong`, {
      method: "post",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    })
      .then((res) => res.json())
      .then((data) => setSong(data[0]))
      .catch((err) => showError("Something went wrong!"));
  }, [id]);

  return (
    <>
      <main>
        <div id="song-info">
          <p>Name: {song.song_title}</p>
          <p>Duration: {formatDuration(song.song_duration)} min</p>
          <p>Genre: {song.genre}</p>
        </div>

        <div id="return-main">
          <Link to="/">Return to main page</Link>
        </div>
      </main>
      <ToastContainer />
    </>
  );
}

export default SongInfo;
