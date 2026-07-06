// One place that knows the backend's URL, so every page imports from here
// instead of hardcoding "http://localhost:8000" everywhere.

export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function analyzeMessage(text, language, city) {
  const res = await fetch(`${API_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language, city: city || null }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Failed to analyze message");
  }
  return res.json();
}

// Sends a screenshot of a scam message to Gemini's vision model.
// Uses FormData (not JSON) because we're uploading a file.
export async function analyzeImage(file, language, city, caption) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("language", language);
  if (city) formData.append("city", city);
  if (caption) formData.append("caption", caption);

  const res = await fetch(`${API_URL}/analyze-image`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || "Failed to analyze image");
  }
  return res.json();
}

export async function fetchGraph() {
  const res = await fetch(`${API_URL}/graph`);
  if (!res.ok) throw new Error("Failed to load graph data");
  return res.json();
}

export async function fetchStats() {
  const res = await fetch(`${API_URL}/stats`);
  if (!res.ok) throw new Error("Failed to load analytics data");
  return res.json();
}

export async function fetchHotspots(scamType) {
  const url = new URL(`${API_URL}/hotspots`);
  if (scamType && scamType !== "all") {
    url.searchParams.set("scam_type", scamType);
  }
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load hotspot data");
  return res.json();
}
