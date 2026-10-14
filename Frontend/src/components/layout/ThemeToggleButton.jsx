import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { FiSun, FiMoon } from "react-icons/fi";

export default function ThemeToggleButton() {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2.5 rounded-full text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all duration-300 flex items-center justify-center shadow-xs hover:scale-105 active:scale-95 cursor-pointer"
      title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
      aria-label="Toggle Theme Mode"
    >
      {theme === "light" ? (
        <FiMoon className="text-lg text-slate-700 hover:text-amber-600 transition-colors" />
      ) : (
        <FiSun className="text-lg text-amber-400 hover:text-amber-300 transition-colors" />
      )}
    </button>
  );
}