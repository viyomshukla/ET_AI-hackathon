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
      <div style={{
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
        <h1 style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
          fontWeight: "400",
          color: "hsl(var(--foreground))",
          lineHeight: "1",
          letterSpacing: "-0.04em",
          margin: "0.5rem 0 0.75rem 0",
        }}>
          Cyber<em style={{ color: "hsl(var(--muted-foreground))", fontStyle: "normal" }}> Shield</em>
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
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "0",
      }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: "none",
              border: "none",
              borderBottom: activeTab === tab.id
                ? "2px solid hsl(var(--foreground))"
                : "2px solid transparent",
              padding: "1rem 1.5rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: activeTab === tab.id
                ? "hsl(var(--foreground))"
                : "hsl(var(--muted-foreground))",
              fontSize: "0.875rem",
              fontFamily: "var(--font-body)",
              fontWeight: activeTab === tab.id ? "500" : "400",
              transition: "all 0.2s ease",
              marginBottom: "-1px",
              whiteSpace: "nowrap",
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content Panel */}
      <div style={{
        maxWidth: "80rem",
        margin: "0 auto",
        padding: "2.5rem 2rem 4rem",
      }}>
        {/* Glassmorphic content card */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "20px",
          padding: "2.5rem",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
          animation: "fade-rise 0.4s ease-out both",
        }}>
          {activeTab === "shield" && <FraudShield />}
          {activeTab === "graph"  && <NetworkGraph />}
          {activeTab === "map"    && <CrimeMap />}
        </div>
      </div>
    </div>
  );
}
