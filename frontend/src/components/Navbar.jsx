import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: isHome ? "rgba(2, 23, 44, 0.15)" : "rgba(2, 23, 44, 0.7)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: isHome ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid rgba(255,255,255,0.07)",
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
            gap: "0.5rem"
          }}
        >
          <span>🛡️</span> Cyber Shield
        </div>

        {/* Nav Links */}
        <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
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
        </div>

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
    </nav>
  );
}
