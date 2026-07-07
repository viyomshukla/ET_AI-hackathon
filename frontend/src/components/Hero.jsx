import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

// Ambient floating particles
function Particle({ x, y, size, delay, duration }) {
  return (
    <div style={{
      position: "absolute",
      left: `${x}%`,
      top: `${y}%`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      background: `radial-gradient(circle, rgba(59,130,246,0.6), transparent)`,
      animation: `float-particle ${duration}s ease-in-out ${delay}s infinite alternate`,
      pointerEvents: "none",
    }} />
  );
}

// Minimal iPhone CSS mockup
function IPhoneMockup({ opacity, scale, x, rotateY, isActive, mousePos }) {
  return (
    <div style={{
      width: "228px",
      height: "450px",
      borderRadius: "44px",
      background: "#090d16",
      border: "3px solid #1e293b",
      boxShadow: `
        0 0 0 1px rgba(255,255,255,0.08),
        0 30px 70px rgba(0,0,0,0.8),
        inset 0 1px 2px rgba(255,255,255,0.15),
        0 0 50px rgba(59,130,246,0.12)
      `,
      position: "absolute",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      overflow: "hidden",
      transform: `scale(${scale}) translateX(${x + mousePos.x * 0.8}px) translateY(${mousePos.y * 0.8}px) rotateY(${rotateY + mousePos.x * 0.6}deg) rotateX(${-mousePos.y * 0.6}deg)`,
      opacity: opacity,
      transition: "all 1.0s cubic-bezier(0.25, 1, 0.5, 1), transform 0.2s ease-out",
      animation: isActive ? "floating-device 6s ease-in-out infinite" : "none",
    }}>
      <div style={{
        position: "absolute", inset: "3px",
        border: "1px solid rgba(255,255,255,0.04)",
        borderRadius: "40px",
        pointerEvents: "none",
        zIndex: 6,
      }} />

      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%)",
        pointerEvents: "none",
        zIndex: 5,
      }} />

      <div style={{
        width: isActive ? "105px" : "92px", 
        height: "29px",
        background: "#000",
        borderRadius: "0 0 19px 19px",
        marginTop: "10px",
        flexShrink: 0,
        zIndex: 10,
        transition: "width 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
      }} />

      <div style={{
        flex: 1, width: "100%", padding: "14px 12px",
        display: "flex", flexDirection: "column", gap: "8px",
        overflowY: "hidden",
        background: isActive ? "rgba(2, 8, 24, 0.96)" : "#020818",
        transition: "background 0.5s ease",
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "0 4px",
          opacity: isActive ? 1 : 0,
          transition: "opacity 0.5s ease 0.2s"
        }}>
          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.5)", fontFamily: "Inter, sans-serif", fontWeight: 600 }}>9:41</span>
          <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
            <div style={{ width: "14px", height: "7px", border: "1px solid rgba(255,255,255,0.4)", borderRadius: "2px", display: "flex", alignItems: "center", paddingLeft: "1px" }}>
              <div style={{ width: "10px", height: "5px", background: "#22c55e", borderRadius: "1px" }} />
            </div>
          </div>
        </div>

        <div style={{ 
          background: "rgba(255,255,255,0.05)", 
          borderRadius: "10px", 
          padding: "8px 10px", 
          border: "1px solid rgba(255,255,255,0.06)",
          opacity: isActive ? 1 : 0,
          transform: isActive ? "translateY(0)" : "translateY(-10px)",
          transition: "all 0.6s ease 0.3s"
        }}>
          <div style={{ fontSize: "7px", color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif", letterSpacing: "0.1em", textTransform: "uppercase" }}>CYBER SHIELD</div>
          <div style={{ fontSize: "11px", color: "white", fontFamily: "Instrument Serif, serif", marginTop: "2px" }}>Safety Platform</div>
        </div>

        <div style={{ 
          background: "rgba(239,68,68,0.12)", 
          border: "1px solid rgba(239,68,68,0.22)", 
          borderRadius: "10px", 
          padding: "8px 10px",
          opacity: isActive ? 1 : 0,
          transform: isActive ? "translateY(0)" : "translateY(-20px)",
          transition: "all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) 0.5s",
          boxShadow: isActive ? "0 0 10px rgba(239,68,68,0.15)" : "none",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
            <span style={{ fontSize: "9px", animation: "bounce 1s infinite alternate" }}>🚨</span>
            <span style={{ fontSize: "8px", color: "#ef4444", fontFamily: "Inter, sans-serif", fontWeight: 600, letterSpacing: "0.08em" }}>FRAUD ALERT</span>
          </div>
          <div style={{ fontSize: "8px", color: "rgba(255,255,255,0.7)", fontFamily: "Inter, sans-serif", lineHeight: "1.4" }}>
            Suspicious UPI detected in Mumbai region
          </div>
        </div>

        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "6px",
          opacity: isActive ? 1 : 0,
          transform: isActive ? "translateY(0)" : "translateY(10px)",
          transition: "all 0.6s ease 0.6s"
        }}>
          {[{ label: "Blocked", val: "1,284", color: "#22c55e" }, { label: "Reports", val: "348", color: "#f59e0b" }].map(s => (
            <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "8px", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ fontSize: "13px", color: s.color, fontFamily: "Instrument Serif, serif", fontWeight: "bold" }}>{s.val}</div>
              <div style={{ fontSize: "7px", color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif", marginTop: "1px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ 
          flex: 1, 
          background: "rgba(59,130,246,0.08)", 
          borderRadius: "10px", 
          border: "1px solid rgba(59,130,246,0.15)", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          flexDirection: "column", 
          gap: "4px", 
          minHeight: "70px",
          opacity: isActive ? 1 : 0,
          transform: isActive ? "scale(1)" : "scale(0.9)",
          transition: "all 0.7s ease 0.7s"
        }}>
          <span style={{ fontSize: "14px", animation: "bounce 2s infinite alternate" }}>🗺️</span>
          <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.35)", fontFamily: "Inter, sans-serif" }}>Crime Hotspot Map</span>
        </div>

        <div className="sweep-btn" style={{ 
          background: "rgba(255,255,255,0.06)", 
          borderRadius: "10px", 
          padding: "10px", 
          textAlign: "center", 
          border: "1px solid rgba(255,255,255,0.1)",
          opacity: isActive ? 1 : 0,
          transition: "opacity 0.6s ease 0.8s",
          cursor: "pointer",
          position: "relative",
          overflow: "hidden"
        }}>
          <span style={{ fontSize: "8px", color: "rgba(255,255,255,0.7)", fontFamily: "Inter, sans-serif", letterSpacing: "0.1em" }}>🛡️ SCAN MESSAGE</span>
        </div>
      </div>

      <div style={{
        width: "100px", height: "4px",
        background: "rgba(255,255,255,0.3)",
        borderRadius: "4px",
        marginBottom: "8px",
        flexShrink: 0,
      }} />
    </div>
  );
}

// Minimal Tablet (iPad) CSS mockup with split view dashboard
function ITabletMockup({ opacity, scale, x, rotateY, isActive, mousePos }) {
  return (
    <div style={{
      width: "310px",
      height: "410px",
      borderRadius: "32px",
      background: "#090d16",
      border: "3.5px solid #1e293b",
      boxShadow: `
        0 0 0 1px rgba(255,255,255,0.08),
        0 35px 75px rgba(0,0,0,0.85),
        inset 0 1px 2px rgba(255,255,255,0.15),
        0 0 60px rgba(59,130,246,0.14)
      `,
      position: "absolute",
      display: "flex",
      flexDirection: "column",
      overflow: "hidden",
      transform: `scale(${scale}) translateX(${x + mousePos.x * 0.8}px) translateY(${mousePos.y * 0.8}px) rotateY(${rotateY + mousePos.x * 0.5}deg) rotateX(${-mousePos.y * 0.5}deg)`,
      opacity: opacity,
      transition: "all 1.0s cubic-bezier(0.25, 1, 0.5, 1), transform 0.2s ease-out",
      animation: isActive ? "floating-device-offset 6s ease-in-out infinite" : "none",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 60%)",
        pointerEvents: "none",
        zIndex: 5,
      }} />

      <div style={{
        flex: 1, width: "100%", padding: "16px 14px",
        display: "flex", flexDirection: "column", gap: "10px",
        background: isActive ? "rgba(2, 8, 24, 0.96)" : "#020818",
        transition: "background 0.5s ease",
      }}>
        {/* Tablet Top Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "8px",
          opacity: isActive ? 1 : 0,
          transition: "opacity 0.5s ease 0.2s"
        }}>
          <span style={{ fontSize: "11px", color: "white", fontFamily: "Instrument Serif, serif", letterSpacing: "0.02em" }}>🛡️ Cyber Shield Tablet</span>
          <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>10:00 AM</span>
        </div>

        {/* Tablet Split Panel */}
        <div style={{ 
          flex: 1, 
          display: "grid", 
          gridTemplateColumns: "110px 1fr", 
          gap: "8px",
          opacity: isActive ? 1 : 0,
          transform: isActive ? "translateY(0)" : "translateY(15px)",
          transition: "all 0.7s ease 0.4s"
        }}>
          {/* Left panel feed */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ fontSize: "6.5px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "Inter, sans-serif" }}>LOGS</div>
            {["UPI Scam Blocked", "IP Blocked: Mumbai", "Screenshot Checked"].map((text, i) => (
              <div key={i} style={{
                background: "rgba(255,255,255,0.03)", borderRadius: "6px", padding: "6px",
                border: "1px solid rgba(255,255,255,0.05)", fontSize: "7px", color: "rgba(255,255,255,0.6)",
                fontFamily: "Inter, sans-serif"
              }}>
                {text}
              </div>
            ))}
          </div>

          {/* Right panel charts */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
              <div style={{ background: "rgba(34,197,94,0.08)", borderRadius: "6px", padding: "6px", border: "1px solid rgba(34,197,94,0.15)" }}>
                <div style={{ fontSize: "12px", color: "#22c55e", fontWeight: "bold", fontFamily: "Instrument Serif, serif" }}>99.2%</div>
                <div style={{ fontSize: "6px", color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>Accuracy</div>
              </div>
              <div style={{ background: "rgba(59,130,246,0.08)", borderRadius: "6px", padding: "6px", border: "1px solid rgba(59,130,246,0.15)" }}>
                <div style={{ fontSize: "12px", color: "#3b82f6", fontWeight: "bold", fontFamily: "Instrument Serif, serif" }}>4.2s</div>
                <div style={{ fontSize: "6px", color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>Response</div>
              </div>
            </div>

            <div style={{
              flex: 1, background: "rgba(255,255,255,0.02)", borderRadius: "6px", padding: "8px",
              border: "1px solid rgba(255,255,255,0.06)", display: "flex", flexDirection: "column", justifyContent: "center", gap: "4px"
            }}>
              <span style={{ fontSize: "7px", color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif" }}>THREAT LEVEL MONITOR</span>
              <div style={{ width: "100%", height: "6px", background: "rgba(255,255,255,0.1)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: "70%", height: "100%", background: "linear-gradient(90deg, #3b82f6, #ef4444)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "6px", color: "rgba(255,255,255,0.3)", fontFamily: "Inter, sans-serif" }}>
                <span>Safe</span>
                <span>Active Threat</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// MacBook CSS mockup
function MacBookMockup({ opacity, scale, x, rotateY, isOpen, mousePos }) {
  const [typedUrl, setTypedUrl] = useState("");

  useEffect(() => {
    if (isOpen) {
      setTypedUrl("");
      const url = "localhost:5173/dashboard";
      let idx = 0;
      const timer = setInterval(() => {
        if (idx < url.length) {
          setTypedUrl(url.slice(0, idx + 1));
          idx++;
        } else {
          clearInterval(timer);
        }
      }, 40);
      return () => clearInterval(timer);
    }
  }, [isOpen]);

  return (
    <div style={{
      position: "absolute",
      transform: `scale(${scale}) translateX(${x + mousePos.x * 0.8}px) translateY(${mousePos.y * 0.8}px) rotateY(${rotateY + mousePos.x * 0.6}deg) rotateX(${-mousePos.y * 0.6}deg)`,
      opacity: opacity,
      transition: "all 1.0s cubic-bezier(0.25, 1, 0.5, 1), transform 0.2s ease-out",
      transformStyle: "preserve-3d",
      perspective: "1200px",
      animation: isOpen ? "floating-device-offset 6s ease-in-out infinite" : "none",
    }}>
      <div style={{
        transformOrigin: "bottom center",
        transform: isOpen ? "rotateX(0deg)" : "rotateX(-95deg)",
        transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)",
        transformStyle: "preserve-3d",
        width: "540px",
        height: "340px",
        background: "linear-gradient(160deg, #161f30 0%, #0d131f 100%)",
        borderRadius: "16px 16px 0 0",
        border: "2.5px solid #1e293b",
        borderBottom: "none",
        boxShadow: `
          0 -10px 40px rgba(0,0,0,0.6),
          inset 0 1px 0 rgba(255,255,255,0.1),
          0 0 80px rgba(59,130,246,0.12)
        `,
        overflow: "hidden",
        position: "relative",
        zIndex: 2,
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0) 50%)",
          pointerEvents: "none", zIndex: 5,
        }} />

        <div style={{
          position: "absolute", top: "8px", left: "50%", transform: "translateX(-50%)",
          width: "6px", height: "6px", borderRadius: "50%",
          background: "rgba(255,255,255,0.2)",
        }} />

        <div style={{ 
          padding: "20px 18px", 
          paddingTop: "28px", 
          height: "100%", 
          display: "flex", 
          flexDirection: "column", 
          gap: "10px",
          opacity: isOpen ? 1 : 0,
          transform: isOpen ? "translateY(0)" : "translateY(15px)",
          transition: "all 0.8s ease 0.6s"
        }}>
          <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "8px", padding: "6px 10px", display: "flex", alignItems: "center", gap: "6px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", gap: "4px" }}>
              {["#ef4444","#f59e0b","#22c55e"].map(c => (
                <div key={c} style={{ width: "8px", height: "8px", borderRadius: "50%", background: c, opacity: 0.7 }} />
              ))}
            </div>
            <div style={{ flex: 1, background: "rgba(255,255,255,0.05)", borderRadius: "4px", padding: "3px 8px", fontSize: "8px", color: "rgba(255,255,255,0.5)", fontFamily: "Inter, sans-serif" }}>
              {typedUrl}
              <span className="cursor-blink" style={{ display: "inline-block", width: "1px", height: "8px", background: "white", marginLeft: "1px" }} />
            </div>
          </div>

          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "160px 1fr", gap: "8px" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)", padding: "10px 8px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.7)", fontFamily: "Instrument Serif, serif", marginBottom: "4px" }}>Cyber Shield</div>
              {["🛡️ Shield","🕸️ Network","🗺️ Map","📊 Analytics"].map((item, i) => (
                <div key={item} style={{ padding: "5px 8px", borderRadius: "5px", background: i === 0 ? "rgba(59,130,246,0.15)" : "transparent", border: i === 0 ? "1px solid rgba(59,130,246,0.2)" : "none", fontSize: "8px", color: i === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)", fontFamily: "Inter, sans-serif" }}>
                  {item}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                {[{ label: "Threats Blocked", val: "12,841", color: "#22c55e" }, { label: "Active Alerts", val: "34", color: "#ef4444" }, { label: "Reports Today", val: "1,203", color: "#f59e0b" }].map(s => (
                  <div key={s.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: "7px", padding: "8px 10px", border: "1px solid rgba(255,255,255,0.06)" }}>
                    <div style={{ fontSize: "14px", color: s.color, fontFamily: "Instrument Serif, serif", fontWeight: "bold" }}>{s.val}</div>
                    <div style={{ fontSize: "7px", color: "rgba(255,255,255,0.35)", fontFamily: "Inter, sans-serif", marginTop: "2px" }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.06)", padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)", fontFamily: "Instrument Serif, serif" }}>Citizen Fraud Shield</div>
                <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: "6px", padding: "8px", border: "1px solid rgba(255,255,255,0.06)", fontSize: "8px", color: "rgba(255,255,255,0.2)", fontFamily: "Inter, sans-serif" }}>
                  Paste suspicious message here...
                </div>
                <div style={{ background: "rgba(59,130,246,0.2)", borderRadius: "6px", padding: "6px", textAlign: "center", border: "1px solid rgba(59,130,246,0.3)", fontSize: "8px", color: "rgba(255,255,255,0.7)", fontFamily: "Inter, sans-serif" }}>
                  🛡️ Analyze
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        width: "560px",
        height: "12px",
        background: "linear-gradient(180deg, #1e293b, #0f172a)",
        borderRadius: "0 0 6px 6px",
        border: "2.5px solid #1e293b",
        borderTop: "none",
        marginLeft: "-10px",
        boxShadow: "0 15px 35px rgba(0,0,0,0.6)",
        position: "relative",
        zIndex: 3,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "1px 0",
      }}>
        <div style={{
          width: "480px", height: "3px",
          background: "rgba(255,255,255,0.03)",
          margin: "0 auto",
          borderRadius: "1px",
          border: "1px solid rgba(255,255,255,0.05)"
        }} />
        <div style={{
          width: "110px", height: "4px",
          background: "rgba(255,255,255,0.05)",
          margin: "0 auto",
          borderRadius: "2px 2px 0 0",
          border: "1px solid rgba(255,255,255,0.08)",
          borderBottom: "none"
        }} />
      </div>
      <div style={{
        width: "580px",
        height: "6px",
        background: "linear-gradient(180deg, #0f172a, #070b14)",
        borderRadius: "0 0 8px 8px",
        marginLeft: "-20px",
        boxShadow: "0 6px 20px rgba(0,0,0,0.7), 0 0 45px rgba(59,130,246,0.15)",
        position: "relative",
        zIndex: 1,
      }} />
    </div>
  );
}

export default function Hero() {
  const navigate = useNavigate();
  const containerRef = useRef(null);
  const [deviceState, setDeviceState] = useState("phone"); // "phone" | "tablet" | "laptop"
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState({ blocked: 0, accuracy: 0, response: 0 });

  // Mouse move parallax tracking
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX - window.innerWidth / 2) / 35;
      const y = (e.clientY - window.innerHeight / 2) / 35;
      setMousePos({ x, y });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Loop between phone, tablet, and laptop states
  useEffect(() => {
    const interval = setInterval(() => {
      setDeviceState(prev => {
        if (prev === "phone") return "tablet";
        if (prev === "tablet") return "laptop";
        return "phone";
      });
    }, 5500);
    return () => clearInterval(interval);
  }, []);

  // GSAP animations on text & stats count-up
  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".hero-h1-line", { opacity: 0, y: 50, rotateX: -15 }, { opacity: 1, y: 0, rotateX: 0, duration: 1, ease: "power3.out", stagger: 0.12, delay: 0.5 });
      gsap.fromTo(".hero-sub", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 1.1 });
      gsap.fromTo(".hero-ctas", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 1.4 });
      gsap.fromTo(".hero-stats", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 1.7 });
      gsap.fromTo(".device-showcase", { opacity: 0, scale: 0.85, x: 60 }, { opacity: 1, scale: 1, x: 0, duration: 1.2, ease: "power3.out", delay: 0.6 });

      const obj = { blocked: 0, accuracy: 0, response: 10 };
      gsap.to(obj, {
        blocked: 12800,
        accuracy: 98.4,
        response: 4.2,
        duration: 2.2,
        ease: "power2.out",
        delay: 1.8,
        onUpdate: () => {
          setStats({
            blocked: Math.floor(obj.blocked).toLocaleString() + "+",
            accuracy: obj.accuracy.toFixed(1) + "%",
            response: obj.response.toFixed(1) + "s"
          });
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const particles = [
    { x: 5, y: 20, size: 4, delay: 0, duration: 4 },
    { x: 12, y: 60, size: 3, delay: 1, duration: 5 },
    { x: 88, y: 15, size: 5, delay: 0.5, duration: 6 },
    { x: 92, y: 70, size: 3, delay: 2, duration: 4.5 },
    { x: 50, y: 85, size: 4, delay: 1.5, duration: 5.5 },
    { x: 20, y: 90, size: 2, delay: 0.8, duration: 4 },
    { x: 75, y: 40, size: 3, delay: 3, duration: 6 },
  ];

  const isPhone  = deviceState === "phone";
  const isTablet = deviceState === "tablet";
  const isLaptop = deviceState === "laptop";

  const phoneProps = {
    opacity: isPhone ? 1 : 0,
    scale:   isPhone ? 1 : 0.6,
    x:       isPhone ? 0 : isTablet ? -100 : 100,
    rotateY: isPhone ? 0 : isTablet ? -35 : 35,
    isActive: isPhone,
    mousePos,
  };

  const tabletProps = {
    opacity: isTablet ? 1 : 0,
    scale:   isTablet ? 1 : 0.6,
    x:       isTablet ? 0 : isLaptop ? -100 : 100,
    rotateY: isTablet ? 0 : isLaptop ? -35 : 35,
    isActive: isTablet,
    mousePos,
  };

  const laptopProps = {
    opacity: isLaptop ? 1 : 0,
    scale:   isLaptop ? 1 : 0.6,
    x:       isLaptop ? 0 : isPhone ? 100 : -100,
    rotateY: isLaptop ? 0 : isPhone ? 35 : -35,
    isOpen: isLaptop,
    mousePos,
  };

  return (
    <div ref={containerRef} style={{
      minHeight: "100vh",
      background: "hsl(var(--background))",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
    }}>
      <style>{`
        @keyframes float-particle {
          from { transform: translateY(0px) scale(1); opacity: 0.4; }
          to   { transform: translateY(-25px) scale(1.3); opacity: 0.15; }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%       { opacity: 0.7; transform: scale(1.05); }
        }
        @keyframes floating-device {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
        @keyframes floating-device-offset {
          0%, 100% { transform: translateY(-6px); }
          50%       { transform: translateY(6px); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-4px); }
        }
        .cursor-blink {
          animation: blink 0.8s infinite;
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        .sweep-btn::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transform: skewX(-25deg);
          animation: sweep 3s infinite;
        }
        @keyframes sweep {
          0% { left: -100%; }
          50% { left: 150%; }
          100% { left: 150%; }
        }
        @keyframes float-orb-1 {
          0% { transform: translate(0px, 0px) scale(1); }
          100% { transform: translate(40px, 30px) scale(1.08); }
        }
        @keyframes float-orb-2 {
          0% { transform: translate(0px, 0px) scale(1); }
          100% { transform: translate(-30px, -40px) scale(1.05); }
        }
      `}</style>

      {/* Floating high-end mesh gradient background orbs */}
      <div style={{
        position: "absolute",
        width: "550px", height: "550px",
        background: "radial-gradient(circle, rgba(99, 102, 241, 0.07) 0%, transparent 70%)",
        top: "-10%", left: "5%",
        filter: "blur(60px)",
        animation: "float-orb-1 15s infinite alternate",
        pointerEvents: "none",
        zIndex: 0
      }} />
      <div style={{
        position: "absolute",
        width: "600px", height: "600px",
        background: "radial-gradient(circle, rgba(45, 212, 191, 0.05) 0%, transparent 70%)",
        bottom: "-15%", right: "8%",
        filter: "blur(70px)",
        animation: "float-orb-2 18s infinite alternate",
        pointerEvents: "none",
        zIndex: 0
      }} />

      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `
          linear-gradient(rgba(59,130,246,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
        transform: `translate(${mousePos.x * 0.25}px, ${mousePos.y * 0.25}px)`,
        transition: "transform 0.15s ease-out"
      }} />

      {/* Radial glow center */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse 80% 60% at 60% 50%, rgba(59,130,246,0.06) 0%, transparent 70%)",
      }} />

      {/* Ambient particles */}
      {particles.map((p, i) => <Particle key={i} {...p} />)}

      {/* Main content */}
      <div style={{
        maxWidth: "88rem",
        margin: "0 auto",
        padding: "0 2.5rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "4rem",
        alignItems: "center",
        width: "100%",
        position: "relative",
        zIndex: 10,
        transform: `rotateX(${-mousePos.y * 0.15}deg) rotateY(${mousePos.x * 0.15}deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.2s ease-out"
      }}>

        {/* LEFT: Text */}
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {/* Eyebrow */}
          <div className="hero-eyebrow" style={{ opacity: 0, display: "inline-flex", alignItems: "center", gap: "0.6rem", marginBottom: "2rem" }}>
            <div style={{
              display: "flex", gap: "0.4rem", alignItems: "center",
              padding: "0.35rem 1rem 0.35rem 0.75rem",
              borderRadius: "9999px",
              border: "1px solid rgba(34,197,94,0.25)",
              background: "rgba(34,197,94,0.06)",
            }}>
              <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 8px #22c55e", animation: "glow-pulse 2s ease infinite" }} />
              <span style={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.65)", fontFamily: "var(--font-body)", fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                Live · Public Safety Platform
              </span>
            </div>
          </div>

          {/* Heading with metallic text gradient */}
          <div style={{ perspective: "800px", marginBottom: "1.75rem" }}>
            <h1 style={{ margin: 0, padding: 0 }}>
              {["Where safety", "rises through", "the silence."].map((line, i) => (
                <div key={i} className="hero-h1-line" style={{
                  opacity: 0,
                  display: "block",
                  fontFamily: "'Instrument Serif', serif",
                  fontSize: "clamp(2.8rem, 5.5vw, 5.5rem)",
                  lineHeight: "0.95",
                  letterSpacing: "-0.035em",
                  fontWeight: "400",
                  background: "linear-gradient(180deg, #ffffff 40%, rgba(255,255,255,0.55) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                  {line}
                </div>
              ))}
            </h1>
          </div>

          {/* Subtitle */}
          <p className="hero-sub" style={{
            opacity: 0,
            color: "hsl(var(--muted-foreground))",
            fontSize: "1.05rem",
            lineHeight: "1.7",
            maxWidth: "34rem",
            marginBottom: "2.5rem",
            fontFamily: "var(--font-body)",
          }}>
            AI-powered fraud detection, network mapping, and geospatial crime intelligence — 
            protecting citizens before the threat reaches them.
          </p>

          {/* CTAs */}
          <div className="hero-ctas" style={{
            opacity: 0,
            display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "3.5rem", flexWrap: "wrap",
          }}>
            <button
              onClick={() => navigate("/dashboard")}
              className="liquid-glass"
              style={{
                borderRadius: "9999px", padding: "0.85rem 2.25rem",
                fontSize: "0.95rem", fontFamily: "var(--font-body)",
                color: "hsl(var(--foreground))", cursor: "pointer",
                letterSpacing: "0.01em",
                transition: "transform 0.2s ease",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
            >
              Try Now →
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "9999px", padding: "0.85rem 2rem",
                fontSize: "0.95rem", fontFamily: "var(--font-body)",
                color: "hsl(var(--muted-foreground))", cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "hsl(var(--foreground))"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "hsl(var(--muted-foreground))"; }}
            >
              View Dashboard
            </button>
          </div>

          {/* Stats */}
          <div className="hero-stats" style={{
            opacity: 0,
            display: "flex", gap: "2.5rem", alignItems: "flex-start",
            paddingTop: "2rem",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}>
            {[
              { value: stats.blocked || "0+", label: "Threats Blocked" },
              { value: stats.accuracy || "0.0%", label: "Detection Accuracy" },
              { value: stats.response || "0.0s", label: "Avg Response Time" },
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontSize: "1.75rem", fontFamily: "'Instrument Serif', serif", color: "hsl(var(--foreground))", lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: "0.78rem", color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-body)", marginTop: "0.35rem", letterSpacing: "0.02em" }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Device Showcase */}
        <div className="device-showcase" style={{
          opacity: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative", height: "520px",
          perspective: "1200px",
        }}>
          {/* Glow behind devices */}
          <div style={{
            position: "absolute",
            width: "320px", height: "320px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
            top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "glow-pulse 3s ease infinite",
            pointerEvents: "none",
          }} />

          {/* Device label pill */}
          <div style={{
            position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)",
            padding: "0.3rem 1rem",
            borderRadius: "9999px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            fontSize: "0.7rem",
            color: "hsl(var(--muted-foreground))",
            fontFamily: "var(--font-body)",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            zIndex: 20,
            transition: "all 0.6s ease",
            whiteSpace: "nowrap",
          }}>
            {isPhone ? "📱 Mobile View" : isTablet ? "📟 Tablet View" : "💻 Desktop View"}
          </div>

          {/* iPhone mockup */}
          <IPhoneMockup {...phoneProps} />

          {/* Tablet mockup */}
          <ITabletMockup {...tabletProps} />

          {/* MacBook mockup */}
          <MacBookMockup {...laptopProps} />
        </div>
      </div>

      {/* Bottom scroll hint */}
      <div style={{
        position: "absolute", bottom: "2rem", left: "50%",
        transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem",
        opacity: 0.3, zIndex: 10,
        animation: "fade-rise 0.8s ease-out 2s both",
      }}>
        <div style={{
          width: "1px", height: "40px",
          background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.5))",
        }} />
        <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "white", fontFamily: "var(--font-body)" }}>Scroll</span>
      </div>
    </div>
  );
}
