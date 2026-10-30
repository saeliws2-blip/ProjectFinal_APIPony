import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom"; // HashRouter: รีเฟรชทุกหน้าได้โดยไม่ต้องแก้ server.js
import App from "./App";
import { GameProvider } from "./context/GameContext";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <GameProvider>
        <App />
      </GameProvider>
    </HashRouter>
  </StrictMode>
);
