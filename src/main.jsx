import React from "react";
import { createRoot } from "react-dom/client";
import SynapseApp from "./synapse/SynapseApp";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SynapseApp />
  </React.StrictMode>
);
