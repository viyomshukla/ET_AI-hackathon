import { useState } from "react";
import { NavLink } from "react-router-dom";

// Simple top navigation shared by all three pages.
export default function Navbar() {
  const linkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

  // Theme is initialized once in main.jsx (from localStorage / OS
  // preference) and stored on <html data-theme="..."> - we just flip it here.
  const [isDark, setIsDark] = useState(
    document.documentElement.dataset.theme === "dark"
  );

  function toggleTheme() {
    const next = isDark ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("theme", next);
    setIsDark(!isDark);
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">🛡️ Digital Public Safety Intelligence Platform</div>
      <div className="navbar-links">
        <NavLink to="/" end className={linkClass}>
          Fraud Shield
        </NavLink>
        <NavLink to="/graph" className={linkClass}>
          Network Graph
        </NavLink>
        <NavLink to="/map" className={linkClass}>
          Crime Map
        </NavLink>
        <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">
          {isDark ? "☀️" : "🌙"}
        </button>
      </div>
    </nav>
  );
}
