import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import { fetchHotspots } from "../api.js";
import AnalyticsCharts from "../components/AnalyticsCharts.jsx";
import Spinner from "../components/Spinner.jsx";

const SCAM_TYPE_OPTIONS = [
  { value: "all", label: "All scam types" },
  { value: "digital_arrest", label: "Digital Arrest Scam" },
  { value: "upi_fraud", label: "UPI Fraud" },
  { value: "phishing", label: "Phishing" },
  { value: "loan_scam", label: "Loan App Scam" },
  { value: "job_scam", label: "Job Scam" },
];

const INDIA_CENTER = [22.9734, 78.6569];

// Turns a raw complaint count into a circle radius (pixels) that stays
// readable whether a city has 2 complaints or 80.
function radiusForCount(count) {
  return Math.min(8 + count * 1.5, 40);
}

export default function CrimeMap() {
  const [scamType, setScamType] = useState("all");
  const [data, setData] = useState({ hotspots: [], total_complaints: 0, top_city: null, top_scam_type: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchHotspots(scamType)
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [scamType]);

  return (
    <div>
      <h1>Geospatial Crime Dashboard</h1>
      <p className="subtitle">
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
          <div className="stat-value">{data.total_complaints}</div>
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
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {data.hotspots.map((h) => (
              <CircleMarker
                key={h.city}
                center={[h.lat, h.lng]}
                radius={radiusForCount(h.count)}
                pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.5 }}
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

      <h2 className="section-heading">Analytics</h2>
      <AnalyticsCharts />
    </div>
  );
}
