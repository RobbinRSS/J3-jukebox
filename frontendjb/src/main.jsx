import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { AuthProvider } from "./AuthContext.jsx";
import Header, { PopupContent } from "./header.jsx";
import MainContent from "./content.jsx";
import Footer from "./footer.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Header />
      <MainContent />
      <Footer />
    </AuthProvider>
  </StrictMode>
);
