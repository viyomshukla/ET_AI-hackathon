import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchStats } from "../api.js";
import Spinner from "./Spinner.jsx";

// Turns backend scam_type codes into friendly labels for the bar chart.
const SCAM_TYPE_LABELS = {
  digital_arrest: "Digital Arrest",
  upi_fraud: "UPI Fraud",
  phishing: "Phishing",
  loan_scam: "Loan Scam",
  job_scam: "Job Scam",
  safe: "Safe",
};

// Charts under the Crime Map's stats panel: complaints by scam type, and a
// 30-day trend line. Kept in its own component so CrimeMap.jsx stays small.
export default function AnalyticsCharts() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats()
      .then(setStats)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner label="Loading analytics..." />;
  if (error) return <div className="error-banner">{error}</div>;
  if (!stats) return null;

  const breakdownData = stats.scam_type_breakdown.map((row) => ({
    name: SCAM_TYPE_LABELS[row.scam_type] || row.scam_type,
    count: row.count,
  }));

  // Show trend dates as "DD Mon" instead of the full ISO string.
  const trendData = stats.daily_counts.map((row) => ({
    date: new Date(row.date).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
    count: row.count,
  }));

  return (
    <div className="analytics-charts">
      <div className="chart-card">
        <h3>Complaints by scam type</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={breakdownData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="chart-card">
        <h3>Complaints per day (last 30 days)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} interval={4} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#dc2626" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
