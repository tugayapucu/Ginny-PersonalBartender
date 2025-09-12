import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      style={{
        backgroundColor: "var(--button-bg)",
        color: "var(--button-text)",
        padding: "10px 20px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
      }}
    >
      {darkMode ? "☀️" : "🌙"}
    </button>
  );
};

export default ThemeToggle;
