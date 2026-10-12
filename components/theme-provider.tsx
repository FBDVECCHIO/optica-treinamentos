"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "dark" | "light";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Carregar preferência salva ou padronizar para o novo tema visual claro
    const saved = localStorage.getItem("optica_theme") as Theme | null;
    if (saved && (saved === "dark" || saved === "light")) {
      setThemeState(saved);
      applyTheme(saved);
    } else {
      setThemeState("light");
      applyTheme("light");
    }
    setMounted(false); // evita mismatch inicial
    setMounted(true);
  }, []);

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem("optica_theme", newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme deve ser utilizado dentro de um ThemeProvider");
  }
  return context;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === "dark" ? "Alternar para Modo Claro" : "Alternar para Modo Escuro"}
      className={`relative p-2 rounded-xl transition-all border flex items-center justify-center cursor-pointer ${
        theme === "dark"
          ? "bg-zinc-900 border-white/10 text-amber-400 hover:bg-zinc-800 hover:text-amber-300 shadow-sm"
          : "bg-slate-100 border-slate-300 text-violet-600 hover:bg-slate-200 hover:text-violet-700 shadow-sm"
      } ${className}`}
      aria-label="Alternar tema claro/escuro"
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
