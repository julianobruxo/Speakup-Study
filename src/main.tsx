import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { areAnimationsEnabled } from "./services/preferences/animations";
import "./index.css";

document.documentElement.dataset.animations =
  areAnimationsEnabled() ? "on" : "off";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
