import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { UserAuthContextProvider } from "./context/UserAuthContext";
import reportWebVitals from "./reportWebVitals";
import Router from "./router/Router";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <BrowserRouter>
    <UserAuthContextProvider>
      <Router />
    </UserAuthContextProvider>
  </BrowserRouter>,
);

reportWebVitals();
