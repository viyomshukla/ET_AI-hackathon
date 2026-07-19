import { useState } from "react";
import FraudShield from "./FraudShield.jsx";
import NetworkGraph from "./NetworkGraph.jsx";
import CrimeMap from "./CrimeMap.jsx";

const TABS = [
  { id: "shield", icon: "🛡️", label: "Citizen Shield", desc: "AI fraud detection" },
  { id: "graph",  icon: "🕸️", label: "Network Graph",  desc: "Fraud ring mapping" },
  { id: "map",    icon: "🗺️", label: "Hotspot Map",    desc: "Geospatial crimes" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("shield");

  return (
    <div style={{
      minHeight: "100vh",
      background: "hsl(var(--background))",
      paddingTop: "6rem",
    }}>
      {/* Page Header */}
      <div className="animate-fade-rise" style={{
        maxWidth: "80rem",
        margin: "0 auto",
        padding: "3rem 2rem 2rem",
      }}>
        <span style={{
          fontSize: "0.75rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "hsl(var(--muted-foreground))",
          fontFamily: "var(--font-body)",
          fontWeight: "500"
        }}>
          Intelligence Operations
        </span>
        <h1 className="shimmer-text" style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
          fontWeight: "400",
          color: "hsl(var(--foreground))",
          lineHeight: "1",
          letterSpacing: "-0.04em",
          margin: "0.5rem 0 0.75rem 0",
        }}>
          Cyber<em style={{ fontStyle: "normal", opacity: 0.85 }}> Shield</em>
        </h1>
        <p style={{
          color: "hsl(var(--muted-foreground))",
          fontSize: "1rem",
          maxWidth: "36rem",
          lineHeight: "1.6",
          margin: 0,
        }}>
          Real-time fraud intelligence, network mapping, and geospatial crime monitoring — all in one place.
        </p>
      </div>

      {/* Tab Navigation */}
      <div style={{
        maxWidth: "80rem",
        margin: "0 auto",
        padding: "0 2rem",
        display: "flex",
        gap: "0.75rem",
        borderBottom: "1px solid var(--card-border)",
        paddingBottom: "0.5rem",
        flexWrap: "wrap",
      }}>
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: isActive ? "var(--tag-bg)" : "transparent",
                border: isActive ? "1px solid var(--card-border)" : "1px solid transparent",
                borderRadius: "12px",
                padding: "0.75rem 1.4rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                fontSize: "0.9rem",
                fontFamily: "var(--font-body)",
                fontWeight: isActive ? "600" : "400",
                transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                whiteSpace: "nowrap",
                boxShadow: isActive ? "0 4px 15px rgba(0,0,0,0.15)" : "none",
                transform: isActive ? "translateY(-1px)" : "none",
              }}
            >
              <span style={{ fontSize: "1.1rem" }}>{tab.icon}</span>
              <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                <span>{tab.label}</span>
                <span style={{ fontSize: "0.7rem", color: "hsl(var(--muted-foreground))", fontWeight: "400" }}>{tab.desc}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Content Panel */}
      <div style={{
        maxWidth: "80rem",
        margin: "0 auto",
        padding: "2rem 2rem 4rem",
      }}>
        {/* Glassmorphic content card */}
        <div
          key={activeTab}
          style={{
            background: "var(--card-bg)",
            border: "1px solid var(--card-border)",
            borderRadius: "20px",
            padding: "2.5rem",
            backdropFilter: "var(--glass-blur)",
            WebkitBackdropFilter: "var(--glass-blur)",
            boxShadow: "var(--card-shadow)",
            animation: "fade-rise 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          {activeTab === "shield" && <FraudShield />}
          {activeTab === "graph"  && <NetworkGraph />}
          {activeTab === "map"    && <CrimeMap />}
        </div>
      </div>
    </div>
  );
}
