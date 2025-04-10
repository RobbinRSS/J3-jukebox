import { useState, useEffect } from "react";
import "./App.css";

export function PopupContent() {
  const [data, setData] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    fetch("http://localhost:8081/users")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.log(err));
  }, []); // [] shows object only once

  const handleSubmit = function (e) {
    e.preventDefault();

    const userFound = data.find(
      (user) => user.name === username && user.password === password
    );

    if (userFound) {
      console.log("Logged in successfully!");
      console.log(username);
    } else {
      console.log("nuh uh");
    }
  };

  return (
    <>
      <div className="modal">
        <h3>Sign Up / Sign In</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <br />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <br />
          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  );
}

function Header() {
  const [showModal, setShowModal] = useState(false);
  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);
  return (
    <>
      <header>
        <h1>Jukebox</h1>
        <div id="header-btns">
          <button onClick={openModal}>Sign Up</button>
          <button onClick={openModal}>Sign In</button>
        </div>
        {/* <p><b>Robbin Schrijver</b></p> NOTE if user is signed in display user name  */}
      </header>
      {showModal && (
        <>
          <div className="overlay" onClick={closeModal}></div>
          <PopupContent />
        </>
      )}
    </>
  );
}

export default Header;
