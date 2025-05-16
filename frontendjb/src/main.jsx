import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";

import { AuthProvider } from "./AuthContext.jsx";
import Header, { PopupContent } from "./header.jsx";
import MainContent from "./content.jsx";
import Footer from "./footer.jsx";
import playlistPage from "./playlistPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<MainContent />} />
          <Route path="/temp-playlist" element={<playlistPage />} />{" "}
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  </StrictMode>
);
