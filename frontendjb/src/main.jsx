import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import Header from "./header.jsx";
import MainContent from "./content.jsx";
import Footer from "./footer.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Header />
    <MainContent />
    <Footer />
  </StrictMode>
);
