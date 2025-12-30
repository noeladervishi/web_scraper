"use client";

import React, { useEffect, useState } from "react";

const THEME_KEY = "theme" as const; // 'light' | 'dark'

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isUserSet, setIsUserSet] = useState<boolean>(false);

  useEffect(() => {
    // run only on client after mount
    setMounted(true);

    try {
      const stored = localStorage.getItem(THEME_KEY) as "light" | "dark" | null;
      if (stored) {
        setTheme(stored);
        setIsUserSet(true);
        document.documentElement.setAttribute("data-theme", stored);
        return;
      }

      // fall back to system preference
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      } else {
        setTheme("light");
        document.documentElement.setAttribute("data-theme", "light");
      }

      // listen for system changes only when user hasn't set a preference
      const mq = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (e: MediaQueryListEvent) => {
        if (!isUserSet) {
          const next = e.matches ? "dark" : "light";
          setTheme(next);
          document.documentElement.setAttribute("data-theme", next);
        }
      };

      if (mq.addEventListener) mq.addEventListener("change", handler);
      else mq.addListener(handler);

      return () => {
        if (mq.removeEventListener) mq.removeEventListener("change", handler);
        else mq.removeListener(handler);
      };
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme, mounted]);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(THEME_KEY, next);
      setIsUserSet(true);
    } catch {
      /* ignore */
    }
    setTheme(next);
  };

  const reset = () => {
    try {
      localStorage.removeItem(THEME_KEY);
    } catch {}
    setIsUserSet(false);
    // adopt system preference on reset
    try {
      const sys = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setTheme(sys);
      document.documentElement.setAttribute("data-theme", sys);
    } catch {}
  };

  if (!mounted) {
    // avoid rendering a theme-specific UI on server to prevent hydration mismatch
    return null;
  }

  return (
    <button
      aria-label={`Toggle ${theme === "dark" ? "dark" : "light"} mode`}
      role="switch"
      aria-checked={theme === "dark"}
      onClick={toggle}
      className="relative inline-flex items-center rounded-full select-none"
      style={{
        width: "60px",
        height: "24px",
        background: theme === "dark" ? "#1ABC9C" : "#c4c6c9",
        border: `2px solid ${theme === "dark" ? "#ffffff" : "#c4c6c9"}`,
        color: "#ffffff",
        transition: "background 180ms ease, border-color 180ms ease",
      }}
    >
      {/* Label */}
      <span
        className="absolute inset-0 flex items-center text-[11px] font-bold pointer-events-none"
        style={{
          justifyContent: theme === "dark" ? "flex-start" : "flex-end",
          padding: "0 10px",
          letterSpacing: "0.02em",
        }}
      >
        {theme === "dark" ? "ON" : "OFF"}
      </span>

      {/* Thumb */}
      <span
        className="absolute rounded-full bg-white shadow"
        style={{
          width: "20px",
          height: "20px",
          top: "2px",
          left: theme === "dark" ? "calc(100% - 22px)" : "2px",
          transition: "left 180ms ease",
        }}
        aria-hidden
      />

      <span className="sr-only">Toggle dark mode</span>
    </button>
  );
}
