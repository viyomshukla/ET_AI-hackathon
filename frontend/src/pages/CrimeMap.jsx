import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { fetchHotspots } from "../api.js";
import AnalyticsCharts from "../components/AnalyticsCharts.jsx";
import Spinner from "../components/Spinner.jsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const SCAM_TYPE_OPTIONS = [
  { value: "all", label: "All scam types" },
  { value: "digital_arrest", label: "Digital Arrest Scam" },
  { value: "upi_fraud", label: "UPI Fraud" },
  { value: "phishing", label: "Phishing" },
  { value: "loan_scam", label: "Loan App Scam" },
  { value: "job_scam", label: "Job Scam" },
];

const INDIA_CENTER = [22.9734, 78.6569];

function radiusForCount(count) {
  return Math.min(8 + count * 1.5, 40);
}

// Rolling Counter Component
function AnimatedCounter({ value }) {
  const ref = useRef(null);
  
  useEffect(() => {
    if (typeof value !== "number" || isNaN(value)) return;
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 1.2,
      ease: "power2.out",
      onUpdate: () => {
        if (ref.current) {
          ref.current.textContent = Math.floor(obj.val);
        }
      }
    });
  }, [value]);

  return <span ref={ref}>0</span>;
}

export default function CrimeMap() {
  const [scamType, setScamType] = useState("all");
  const [data, setData] = useState({ hotspots: [], total_complaints: 0, top_city: null, top_scam_type: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const analyticsRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    fetchHotspots(scamType)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [scamType]);

  // GSAP ScrollTrigger for revealing analytics
  useEffect(() => {
    if (loading || error) return;
    
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".analytics-section",
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".analytics-section",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }, analyticsRef);

    return () => ctx.revert();
  }, [loading, error]);

  return (
    <div>
      <span className="chapter-number">Chapter 03</span>
      <h2>Geospatial Crime Dashboard</h2>
      <p className="section-subtitle">
        Complaint hotspots across India. Circle size = number of complaints in
        that city.
      </p>

      <div className="map-controls">
        <label htmlFor="scam-filter">Filter by scam type:</label>
        <select
          id="scam-filter"
          value={scamType}
          onChange={(e) => setScamType(e.target.value)}
        >
          {SCAM_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="stats-panel">
        <div className="stat-card">
          <div className="stat-label">Total complaints</div>
          <div className="stat-value">
            <AnimatedCounter value={data.total_complaints} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Top scam type</div>
          <div className="stat-value">{data.top_scam_type || "-"}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Top city</div>
          <div className="stat-value">{data.top_city || "-"}</div>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {loading && <Spinner label="Loading map..." />}

      {!loading && !error && (
        <div className="leaflet-map-container">
          <MapContainer
            center={INDIA_CENTER}
            zoom={5}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {data.hotspots.map((h) => (
              <CircleMarker
                key={h.city}
                center={[h.lat, h.lng]}
                radius={radiusForCount(h.count)}
                pathOptions={{ color: "var(--danger)", fillColor: "var(--danger)", fillOpacity: 0.5, weight: 1 }}
              >
                <Tooltip>
                  <strong>{h.city}</strong>
                  <br />
                  {h.count} complaint{h.count === 1 ? "" : "s"}
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      )}

      {!loading && !error && (
        <div ref={analyticsRef} className="analytics-section" style={{ opacity: 0 }}>
          <h2 className="section-heading">Analytics</h2>
          <AnalyticsCharts />
        </div>
      )}
    </div>
  );
}
