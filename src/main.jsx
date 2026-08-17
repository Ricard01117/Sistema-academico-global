import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import {
  HashRouter,
} from "react-router-dom";

import App from "./App";

import {
  AuthProvider,
} from "./context/AuthContext";

import {
  ThemeProvider,
} from "./context/ThemeContext";

import {
  ChartThemeProvider,
} from "./context/ChartThemeContext";

import {
  DashboardProvider,
} from "./context/DashboardContext";

import "./assets/styles/variables.css";
import "./assets/styles/themes.css";
import "./assets/styles/globals.css";

/*
  IMPORTANTE:
  Este archivo va al final para que
  las mejoras de los CRUD tengan prioridad.
*/
import "./assets/styles/crud.css";


createRoot(
  document.getElementById("root"),
).render(
  <StrictMode>
    <HashRouter>
      <AuthProvider>
        <ThemeProvider>
          <ChartThemeProvider>
            <DashboardProvider>
              <App />
            </DashboardProvider>
          </ChartThemeProvider>
        </ThemeProvider>
      </AuthProvider>
    </HashRouter>
  </StrictMode>,
);