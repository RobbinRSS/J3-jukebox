import { useState, useEffect } from "react";
import "./index.css";

export function PopupContent({ setUsernameFromLogin, loginType }) {
  const [data, setData] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8081/users")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.log(err));
  }, []); // [] shows object only once

  const handleSubmit = function (e) {
    e.preventDefault();

    const userNameFound = data.find((user) => user.name === username);

    const userFound = data.find(
      (user) => user.name === username && user.password === password
    );

    if (userNameFound && loginType === "signUp") {
      setErrorMessage("Username already exists");
    } else if (userFound && loginType === "signIn") {
      setUsernameFromLogin(username);
    } else if (!userFound && loginType === "signIn") {
      setErrorMessage("User is not found");
    } else if (!userNameFound && loginType === "signUp") {
      console.log("Account succesfully created");
      // TODO logica om aan de sql database toe te voegen
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
        {errorMessage && <div className="error-message">{errorMessage}</div>}
      </div>
    </>
  );
}

function Header() {
  const [showModal, setShowModal] = useState(false);
  const [username, setUsername] = useState("");
  const [type, setLoginType] = useState("");

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const openSignIn = () => {
    setLoginType("signIn");
    openModal();
  };

  const openSignUp = () => {
    setLoginType("signUp");
    openModal();
  };

  const setUsernameFromLogin = (name) => {
    setUsername(name);
    closeModal();
  };
  return (
    <>
      <header>
        <h1>Jukebox</h1>
        {(!username && (
          <>
            <div id="header-btns">
              <button onClick={openSignUp}>Sign Up</button>
              <button onClick={openSignIn}>Sign In</button>
            </div>
          </>
        )) || (
          <>
            {" "}
            <p>
              <b>{username}</b>
            </p>{" "}
          </>
        )}
      </header>
      {showModal && (
        <>
          <div className="overlay" onClick={closeModal}></div>
          <PopupContent
            setUsernameFromLogin={setUsernameFromLogin}
            loginType={type}
          />
        </>
      )}
    </>
  );
}

export default Header;
