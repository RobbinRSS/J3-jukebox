import { useState, useEffect, useContext } from "react";
import { AuthContext } from "./AuthContext.jsx";
import { useNavigate } from "react-router-dom";

import "./index.css";

export function PopupContent({ setUsernameFromLogin, loginType }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { setUserSession } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (loginType === "signIn") {
      fetch(`${import.meta.env.VITE_API_URL}/signin`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message === "User logged in successfully") {
            setUsernameFromLogin(data.username);
            setUserSession({ loggedIn: true, user: data.user });
            navigate("/");
            window.location.reload();
          } else {
            setErrorMessage(data.message || "Login failed");
          }
        })
        .catch((err) => {
          console.log(err);
          setErrorMessage("Something went wrong during sign in");
        });
    } else if (loginType === "signUp") {
      fetch(`${import.meta.env.VITE_API_URL}/signup`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message === "Account successfully created") {
            setUsernameFromLogin(data.username);
            navigate("/");
            window.location.reload();
          } else {
            setErrorMessage(data.message || "Sign up failed");
          }
        })
        .catch((err) => {
          console.log(err);
          setErrorMessage("Something went wrong during sign up");
        });
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
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/check-session`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.loggedIn) {
          setUsername(data.user.username);
        }
      })
      .catch((err) => {
        console.error("Error checking session:", err);
      });
  }, []);

  function logOut() {
    fetch(`${import.meta.env.VITE_API_URL}/log-out`, {
      method: "GET",
      credentials: "include",
    })
      .then(() => {
        setUsername("");
        navigate("/");
        window.location.reload();
      })
      .catch((err) => {
        console.error("Error during logout:", err);
      });
  }

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
            <div className="user-info">
              <p>
                <b>{username}</b>
              </p>
              <select
                name="dropdown-user"
                id="dropdown-user"
                onChange={(e) => {
                  if (e.target.value === "logout") {
                    logOut();
                  }
                }}
              >
                <option value=""></option>
                <option value="logout">Logout</option>
              </select>
            </div>
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
