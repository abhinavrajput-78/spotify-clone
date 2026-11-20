import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";

import { UserProvider } from "./context/User";
import { SongProvider } from "./context/Song";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <SongProvider>
        <App />
      </SongProvider>
    </UserProvider>
  </React.StrictMode>
);