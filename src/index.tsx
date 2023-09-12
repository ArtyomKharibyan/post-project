import React from 'react';
import ReactDOM from 'react-dom/client';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import Router from "./router/Router";
import {UserAuthContextProvider} from "./context/UserAuthContext";

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
      <BrowserRouter>
          <UserAuthContextProvider>
          <Router />
          </UserAuthContextProvider>
      </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();
