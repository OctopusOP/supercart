"use client";
import React from "react";
import { useTheme } from "@/context/ThemeContext";
import { IoSunny, IoMoon } from "react-icons/io5";

// Desktop nav icon button — shows the opposite icon (click to switch)
export const ThemeToggle = ({ className = "" }) => {
  const { resolvedTheme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse ${className}`} />
    );
  }

  // When dark → show Sun (click switches to light)
  // When light → show Moon (click switches to dark)
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative flex items-center justify-center p-2 rounded-full text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer ${className}`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDark ? (
        <IoSunny className="text-xl text-amber-400" />
      ) : (
        <IoMoon className="text-xl text-indigo-500" />
      )}
    </button>
  );
};

// Mobile drawer two-button pill — Light | Dark
export const ThemeSegmentedControl = ({ className = "" }) => {
  const { resolvedTheme, setTheme, mounted } = useTheme();

  if (!mounted) {
    return <div className="h-10 w-full bg-zinc-100 dark:bg-zinc-800 rounded-2xl animate-pulse" />;
  }

  const options = [
    { id: "light", label: "Light", icon: IoSunny, color: "text-amber-500" },
    { id: "dark",  label: "Dark",  icon: IoMoon,  color: "text-indigo-400" },
  ];

  return (
    <div className={`flex items-center p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl border border-zinc-200 dark:border-zinc-700/80 ${className}`}>
      {options.map((opt) => {
        const Icon = opt.icon;
        const isActive = resolvedTheme === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => setTheme(opt.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium transition cursor-pointer ${
              isActive
                ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs"
                : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
            }`}
          >
            <Icon className={`text-sm ${opt.color}`} />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
