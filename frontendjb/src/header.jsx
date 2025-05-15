import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";

import "./index.css";

export function PopupContent({ setUsernameFromLogin, loginType }) {
  const [data, setData] = useState([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  // console.log(password);

  const { setIsLoggedIn } = useContext(AuthContext);

  useEffect(() => {
    fetch("http://localhost:8081/users")
      .then((res) => res.json())
      .then((data) => setData(data))
      .catch((err) => console.log(err));
  }, []); // [] shows object only once

  const handleSubmit = function (e) {
    e.preventDefault();

    const userNameFound = data.find((user) => user.name === username);

    if (userNameFound && loginType === "signUp") {
      setErrorMessage("Username already exists");
    } else if (loginType === "signIn") {
      fetch("http://localhost:8081/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message === "User logged in successfully") {
            setUsernameFromLogin(username);
            setIsLoggedIn(true);
          } else {
            setErrorMessage(data.message);
          }
        })
        .catch((err) => console.log(err));
    } else if (!userNameFound && loginType === "signIn") {
      setErrorMessage("User is not found");
    } else if (!userNameFound && loginType === "signUp") {
      fetch("http://localhost:8081/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
        .then((res) => res.json())
        .then((data) => {
          setUsernameFromLogin(username);
          setIsLoggedIn(true);
        })
        .catch((err) => console.log(err));
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
            minLength={6}
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
