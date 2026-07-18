import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "light" ? "dark" : "light"));
  };

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      background: "var(--navbar-bg)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--card-border)",
      transition: "all 0.3s ease",
    }}>
      <div style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.25rem 2.5rem",
        maxWidth: "80rem",
        margin: "0 auto",
        width: "100%",
      }}>

        {/* Brand */}
        <div
          onClick={() => navigate("/")}
          className="hover-lift"
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "1.75rem",
            color: "hsl(var(--foreground))",
            letterSpacing: "-0.025em",
            cursor: "pointer",
            userSelect: "none",
            lineHeight: 1,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.2rem 0.5rem",
            borderRadius: "10px",
            transition: "transform 0.2s ease, filter 0.2s ease",
          }}
          onMouseEnter={e => e.currentTarget.style.filter = "drop-shadow(0 0 12px rgba(59,130,246,0.5))"}
          onMouseLeave={e => e.currentTarget.style.filter = "none"}
        >
          <span style={{ transition: "transform 0.3s ease", display: "inline-block" }}>🛡️</span> Cyber Shield
        </div>

        {/* Nav Links & Actions */}
        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              fontSize: "0.875rem",
              fontFamily: "var(--font-body)",
              background: "none",
              border: "none",
              color: isHome ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
              cursor: "pointer",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => e.target.style.color = "hsl(var(--foreground))"}
            onMouseLeave={e => e.target.style.color = isHome ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))"}
          >
            Home
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              fontSize: "0.875rem",
              fontFamily: "var(--font-body)",
              background: "none",
              border: "none",
              color: !isHome ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
              cursor: "pointer",
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={e => e.target.style.color = "hsl(var(--foreground))"}
            onMouseLeave={e => e.target.style.color = !isHome ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))"}
          >
            Dashboard
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="nav-theme-toggle"
            title={`Switch to ${theme === "light" ? "Dark" : "Light"} mode`}
            style={{
              background: "var(--tag-bg)",
              border: "1px solid var(--card-border)",
              borderRadius: "9999px",
              padding: "0.45rem 0.95rem",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              color: "hsl(var(--foreground))",
              fontSize: "0.825rem",
              fontFamily: "var(--font-body)",
              fontWeight: "600",
              whiteSpace: "nowrap",
              lineHeight: "1",
              minWidth: "auto",
              height: "auto",
              transition: "all 0.2s ease",
            }}
          >
            <span>{theme === "light" ? "🌙 Dark" : "☀️ Light"}</span>
          </button>

          {/* CTA */}
          <button
            onClick={() => navigate("/dashboard")}
            className="liquid-glass"
            style={{
              borderRadius: "9999px",
              padding: "0.6rem 1.5rem",
              fontSize: "0.875rem",
              fontFamily: "var(--font-body)",
              color: "hsl(var(--foreground))",
              cursor: "pointer",
              letterSpacing: "0.01em",
            }}
          >
            Begin Journey
          </button>
        </div>
      </div>
    </nav>
  );
}
