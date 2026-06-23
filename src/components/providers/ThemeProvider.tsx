"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "nim:chrome";

function readInitialChrome(): Chrome {
  if (typeof window === "undefined") return "dark";
  const stored = window.localStorage.getItem(STORAGE_KEY) as Chrome | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

/**
 * Light/dark for builder + dashboard *chrome* only (published invites are
 * dark-cinematic by design — doc 01). Persists to localStorage and reflects to
 * <html data-chrome="...">, which the token CSS keys off.
 */
type Chrome = "light" | "dark";

interface ThemeCtx {
  chrome: Chrome;
  setChrome: (c: Chrome) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx>({
  chrome: "dark",
  setChrome: () => {},
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [chrome, setChromeState] = useState<Chrome>(readInitialChrome);

  useEffect(() => {
    document.documentElement.setAttribute("data-chrome", chrome);
    window.localStorage.setItem(STORAGE_KEY, chrome);
  }, [chrome]);

  const setChrome = useCallback((c: Chrome) => setChromeState(c), []);
  const toggle = useCallback(
    () => setChromeState((c) => (c === "dark" ? "light" : "dark")),
    [],
  );

  return (
    <ThemeContext.Provider value={{ chrome, setChrome, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useChromeTheme(): ThemeCtx {
  return useContext(ThemeContext);
}
