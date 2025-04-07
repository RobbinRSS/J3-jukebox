import { useState } from "react";
import "./App.css";

function Header() {
  return (
    <>
      <header>
        <h1>Jukebox</h1>
        <div id="header-btns">
          <button>Sign Up</button>
          <button>Sign In</button>
        </div>
        {/* <p><b>Robbin Schrijver</b></p> NOTE if user is signed in display user name  */}
      </header>
    </>
  );
}

export default Header;
