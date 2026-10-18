import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App.jsx";
import "./styles.css";
import "./revision-five.css";
import "./personal-places.css";

createRoot(document.getElementById("journey-atlas-root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
