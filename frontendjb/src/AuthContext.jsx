// NOTE Authcontext is bedoeld om data zoals isLoggedIn te delen tussen componenten een soortvan globale veriabele

// imports / exports //
import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();
//

export function AuthProvider({ children }) {
  // global variable to check for session //
  const [userSession, setUserSession] = useState({ loggedIn: false });
  //

  // after initialize check if logged in if so userSession will be true //
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/check-session`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setUserSession(data))
      .catch((err) => console.error(err));
  }, []);
  //

  // formatting from seconds to min:sec //
  function formatDuration(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }
  //

  return (
    <AuthContext.Provider
      value={{ userSession, setUserSession, formatDuration }}
    >
      {children}
    </AuthContext.Provider>
  );
}
