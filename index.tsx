import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./styles/tokens.css";
import "./styles/shell.css";
import "./styles/dashboard.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find the KNOuX REC root element.");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
