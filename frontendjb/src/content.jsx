import { useState } from "react";
import "./App.css";

function MainContent() {
  return (
    <>
      {/* NOTE main gaat de design importeren van alle songs of als gebruiker op playlist klikt dan playlist */}
      <main>
        <h2>Songs</h2>
        {/* NOTE Database naam / playlist naam  */}
        <section id="all-songs">
          <div id="song">
            Songname1 <span id="duration-song">1:10</span>
            <button id="add-to-playlist">+</button>
          </div>
          <div id="song">
            Songname2 <span id="duration-song">1:14</span>
            <button id="add-to-playlist">+</button>
          </div>
          <div id="song">
            Songname3 <span id="duration-song">2:45</span>
            <button id="add-to-playlist">+</button>
          </div>
          <div id="song">
            Songname4 <span id="duration-song">1:56</span>
            <button id="add-to-playlist">+</button>
          </div>
        </section>
      </main>

      {/* NOTE alle href krijgen url parameters  */}
      <section id="all-playlists">
        <h2>Playlists</h2>
        <a href="#">Temporary playlist</a>
        <a href="#">playlist[.name]</a>
        <a href="#">playlist[.name]</a>
        <a href="#">playlist[.name]</a>
        <a href="#">playlist[.name]</a>
        <a href="#">playlist[.name]</a>
        <a href="#">playlist[.name]</a>
      </section>

      <div class="modal hidden">
        <h3>Sign Up / Sign In</h3>
        <form>
          <input type="text" placeholder="Username" required />
          <br />
          <input type="password" placeholder="Password" required />
          <br />
          <button type="submit">Submit</button>
        </form>
      </div>
      <div class="overlay hidden"></div>
    </>
  );
}

export default MainContent;
