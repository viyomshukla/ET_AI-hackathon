import { useState, useEffect } from "react";
import { analyzeMessage, analyzeImage } from "../api.js";
import anime from "animejs";

// Turns backend scam_type codes into friendly labels for display.
const SCAM_TYPE_LABELS = {
  digital_arrest: "Digital Arrest Scam",
  upi_fraud: "UPI Fraud",
  phishing: "Phishing",
  loan_scam: "Loan App Scam",
  job_scam: "Job Scam",
  safe: "Safe",
};

export default function FraudShield() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("English");
  const [city, setCity] = useState("");
  const [image, setImage] = useState(null); // File | null - screenshot to analyze instead of text
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [history, setHistory] = useState([]); // list of {userText, imagePreviewUrl, result}
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    anime.timeline({ loop: false })
      .add({
        targets: '.header-word',
        translateY: [50, 0],
        opacity: [0, 1],
        easing: "easeOutExpo",
        duration: 1000,
        delay: (el, i) => 200 + 100 * i
      })
      .add({
        targets: '.hero-subtitle',
        opacity: [0, 1],
        translateY: [20, 0],
        easing: "easeOutExpo",
        duration: 800,
      }, '-=700')
      .add({
        targets: '.chat-form',
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.98, 1],
        easing: "easeOutElastic(1, .8)",
        duration: 1200
      }, '-=600');
  }, []);

  function handleImageChange(e) {
    const file = e.target.files[0] || null;
    setImage(file);
    setImagePreviewUrl(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!text.trim() && !image) return;

    setLoading(true);
    setError(null);

    try {
      let result;
      if (image) {
        result = await analyzeImage(image, language, city, text);
      } else {
        result = await analyzeMessage(text, language, city);
      }
      setHistory((prev) => [
        ...prev,
        { userText: text, imagePreviewUrl, result },
      ]);
      setText("");
      setImage(null);
      setImagePreviewUrl(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ overflow: "hidden" }}>
      <span className="chapter-number">Chapter 01</span>
      <h2 style={{ display: "flex", overflow: "hidden", fontSize: "2.75rem", fontWeight: "800", letterSpacing: "-0.03em", margin: "0 0 0.5rem 0" }}>
        <span className="header-word" style={{ display: "inline-block", marginRight: "10px" }}>Citizen</span>
        <span className="header-word" style={{ display: "inline-block", marginRight: "10px" }}>Fraud</span>
        <span className="header-word" style={{ display: "inline-block" }}>Shield</span>
      </h2>
      <p className="section-subtitle hero-subtitle" style={{ opacity: 0 }}>
        Paste a suspicious message, SMS, or call description below, or upload
        a screenshot instead. Our AI will tell you if it looks like a scam.
      </p>

      <form className="chat-form" onSubmit={handleSubmit} style={{ opacity: 0 }}>
        <div className="form-row">
          <textarea
            placeholder={
              image
                ? "Optional: add a short caption about the screenshot..."
                : "Example: I got a call from someone claiming to be from the police saying I'll be arrested unless I pay a fine right now..."
            }
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>Or upload a screenshot</label>
            <input
              id="image"
              type="file"
              accept="image/png, image/jpeg"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <label htmlFor="image" className="submit-btn" style={{ 
              background: "rgba(255,255,255,0.05)", 
              border: "1px solid var(--border)", 
              color: "var(--text)", 
              boxShadow: "none",
              cursor: "pointer",
              textAlign: "center",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem"
            }}>
              📁 {image ? `Selected: ${image.name.slice(0, 15)}...` : "Choose Screenshot"}
            </label>
          </div>
          {imagePreviewUrl && (
            <div className="form-field">
              <label>Preview</label>
              <div className="image-preview-container">
                <img src={imagePreviewUrl} alt="Screenshot preview" className="image-preview" />
                {image && (
                  <button type="button" className="close-btn" style={{
                    background: "var(--error-bg)",
                    color: "var(--error-text)",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.5rem 0.75rem",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.85rem"
                  }} onClick={() => { setImage(null); setImagePreviewUrl(null); }}>
                    Remove
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="language">Reply language</label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>

          <div className="form-field">
            <label htmlFor="city">Your city (optional)</label>
            <input
              id="city"
              type="text"
              placeholder="e.g. Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
        </div>

        <button className="submit-btn" type="submit" disabled={loading}>
          {loading ? "Analyzing..." : image ? "🛡️ Analyze Screenshot" : "🛡️ Analyze Message"}
        </button>
      </form>

      {error && <div className="error-banner">{error}</div>}

      <div className="chat-history">
        {history
          .slice()
          .reverse()
          .map((entry, idx) => (
            <ResultCard key={idx} entry={entry} />
          ))}
      </div>
    </div>
  );
}

function ResultCard({ entry }) {
  const { userText, imagePreviewUrl, result } = entry;
  const verdictClass = result.verdict.toLowerCase(); // "scam" | "suspicious" | "safe"

  return (
    <div className={`result-card ${verdictClass}`}>
      {imagePreviewUrl ? (
        <>
          <img src={imagePreviewUrl} alt="Analyzed screenshot" className="image-preview" />
          {userText && <p className="user-message">"{userText}"</p>}
        </>
      ) : (
        <p className="user-message">"{userText}"</p>
      )}
      <div className="result-header">
        <span className={`verdict-badge ${verdictClass}`}>{result.verdict}</span>
        <span className="scam-type-tag">
          {SCAM_TYPE_LABELS[result.scam_type] || result.scam_type}
        </span>
        <span className="confidence">Confidence: {result.confidence}%</span>
      </div>
      <p>{result.explanation}</p>
      <p className="advice">💡 {result.advice}</p>
    </div>
  );
}
