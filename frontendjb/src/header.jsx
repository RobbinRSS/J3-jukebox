import { useState } from "react";
import "./App.css";

export function PopupContent() {
  return (
    <>
      <div className="modal">
        <h3>Sign Up / Sign In</h3>
        <form>
          <input type="text" placeholder="Username" required />
          <br />
          <input type="password" placeholder="Password" required />
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
