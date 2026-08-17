import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  themeIds,
} from "../config/themes";


const ThemeContext =
  createContext(null);


const THEME_KEY =
  "academic-global-theme";

const ACCENT_KEY =
  "academic-global-accent";


export function ThemeProvider({
  children,
}) {
  const [theme, setTheme] =
    useState(() => {
      return (
        localStorage.getItem(THEME_KEY) ||
        "light"
      );
    });

  const [accent, setAccent] =
    useState(() => {
      return (
        localStorage.getItem(ACCENT_KEY) ||
        "blue"
      );
    });


  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme,
    );

    localStorage.setItem(
      THEME_KEY,
      theme,
    );
  }, [theme]);


  useEffect(() => {
    document.documentElement.setAttribute(
      "data-accent",
      accent,
    );

    localStorage.setItem(
      ACCENT_KEY,
      accent,
    );
  }, [accent]);


  function cycleTheme() {
    const currentIndex =
      themeIds.indexOf(theme);

    const nextIndex =
      (currentIndex + 1) %
      themeIds.length;

    setTheme(
      themeIds[nextIndex],
    );
  }


  const value = useMemo(
    () => ({
      theme,
      accent,
      setTheme,
      setAccent,
      cycleTheme,
    }),
    [
      theme,
      accent,
    ],
  );


  return (
    <ThemeContext.Provider
      value={value}
    >
      {children}
    </ThemeContext.Provider>
  );
}


export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme debe utilizarse dentro de ThemeProvider",
    );
  }

  return context;
}