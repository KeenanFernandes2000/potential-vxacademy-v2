import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "react-international-phone/style.css";
import "./phone.css";
import "./homepage.css";
// import "./index.css";
import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
