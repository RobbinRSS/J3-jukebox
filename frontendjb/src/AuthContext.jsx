// NOTE Authcontext is bedoeld om data zoals isLoggedIn te delen tussen componenten een soortvan globale veriabele

import { createContext, useState } from "react";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState({});
  console.log(userInfo);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, setIsLoggedIn, userInfo, setUserInfo }}
    >
      {children}
    </AuthContext.Provider>
  );
}
