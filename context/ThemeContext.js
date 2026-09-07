"use client";
import { createContext, useContext, useEffect, useState, useCallback, useSyncExternalStore } from "react";

const ThemeContext = createContext({
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
  mounted: false,
});

function subscribeTheme(callback) {
  window.addEventListener("storage", callback);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  media.addEventListener("change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    media.removeEventListener("change", callback);
  };
}

function getThemeSnapshot() {
  try {
    return localStorage.getItem("theme") || "system";
  } catch {
    return "system";
  }
}

function getServerSnapshot() {
  return "system";
}

function getSystemDarkSnapshot() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getSystemDarkServerSnapshot() {
  return false;
}

export const ThemeProvider = ({ children }) => {
  const isMounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const [themeState, setThemeState] = useState(null);

  const storedTheme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerSnapshot);
  const systemIsDark = useSyncExternalStore(subscribeTheme, getSystemDarkSnapshot, getSystemDarkServerSnapshot);

  const theme = themeState !== null ? themeState : storedTheme;
  const resolvedTheme =
    theme === "dark" || (theme === "system" && systemIsDark) ? "dark" : "light";

  useEffect(() => {
    const root = document.documentElement;
    if (resolvedTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [resolvedTheme]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("theme", newTheme);
      window.dispatchEvent(new Event("storage"));
    } catch (e) {
      console.error("Failed to save theme:", e);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    // Only toggle between light and dark — no system option
    const next = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(next);
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        mounted: isMounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export default ThemeContext;
