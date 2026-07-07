import { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import { fetchGraph } from "../api.js";
import Spinner from "../components/Spinner.jsx";

// One color per node type - used for both the graph dots and the legend.
const NODE_COLORS = {
  complaint: "#2563eb", // blue
  phone: "#f59e0b", // orange
  account: "#16a34a", // green
};

const DIMMED_COLOR = "rgba(150, 150, 150, 0.25)";

export default function NetworkGraph() {
  const [graphData, setGraphData] = useState({ nodes: [], links: [], rings: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [focusedRingId, setFocusedRingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const containerRef = useRef(null);
  const [width, setWidth] = useState(800);

  useEffect(() => {
    fetchGraph()
      .then(setGraphData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Keep the graph canvas the same width as its container, including on resize.
  useEffect(() => {
    function updateWidth() {
      if (containerRef.current) {
        setWidth(containerRef.current.offsetWidth);
      }
    }
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // How many links touch a given node - shown in the details panel for
  // phone/account nodes so you can see how big a fraud ring is.
  function countConnections(nodeId) {
    return graphData.links.filter(
      (l) =>
        (l.source.id || l.source) === nodeId || (l.target.id || l.target) === nodeId
    ).length;
  }

  // A phone/account node "belongs" to a ring if any complaint it's linked
  // to belongs to that ring - used to dim/highlight the whole ring together.
  function nodeRingId(node) {
    if (node.type === "complaint") return node.ring_id;
    const neighborComplaint = graphData.links
      .filter((l) => (l.source.id || l.source) === node.id || (l.target.id || l.target) === node.id)
      .map((l) => {
        const otherId = (l.source.id || l.source) === node.id ? l.target.id || l.target : l.source.id || l.source;
        return graphData.nodes.find((n) => n.id === otherId);
      })
      .find((n) => n && n.ring_id);
    return neighborComplaint ? neighborComplaint.ring_id : null;
  }

  function getNodeColor(node) {
    const baseColor = NODE_COLORS[node.type] || "#999";
    if (!focusedRingId) return baseColor;
    return nodeRingId(node) === focusedRingId ? baseColor : DIMMED_COLOR;
  }

  return (
    <div>
      <span className="chapter-number">Chapter 02</span>
      <h2>Fraud Network Graph</h2>
      <p className="section-subtitle">
        Complaints that share the same phone number or bank account are
        connected here, revealing possible fraud rings. Bigger dots mean
        bigger rings.
      </p>

      {error && <div className="error-banner">{error}</div>}
      {loading && <Spinner label="Loading graph..." />}

      {!loading && !error && (
        <div className="graph-layout">
          <div className="graph-wrapper" ref={containerRef}>
            <div className="legend">
              <span className="legend-item">
                <span
                  className="legend-dot"
                  style={{ background: NODE_COLORS.complaint }}
                />
                Complaint
              </span>
              <span className="legend-item">
                <span className="legend-dot" style={{ background: NODE_COLORS.phone }} />
                Phone number
              </span>
              <span className="legend-item">
                <span
                  className="legend-dot"
                  style={{ background: NODE_COLORS.account }}
                />
                Bank account
              </span>
              <span style={{ marginLeft: "auto", color: "#666" }}>
                {graphData.nodes.length} nodes, {graphData.links.length} links
              </span>
            </div>

            <ForceGraph2D
              graphData={graphData}
              width={width}
              height={550}
              nodeId="id"
              nodeLabel="label"
              nodeColor={getNodeColor}
              nodeVal={(node) => (node.type === "complaint" ? Math.min(node.ring_size || 1, 8) : 1)}
              nodeRelSize={5}
              linkColor={() => "rgba(0,0,0,0.2)"}
              onNodeClick={(node) => setSelectedNode(node)}
            />

            {selectedNode && (
              <div className="node-details">
                <button className="close-btn" onClick={() => setSelectedNode(null)}>
                  ✕
                </button>
                <h3>{selectedNode.type === "complaint" ? "Complaint" : selectedNode.type}</h3>

                {selectedNode.type === "complaint" ? (
                  <>
                    <p>{selectedNode.full_text}</p>
                    <p>
                      <strong>Verdict:</strong> {selectedNode.verdict} <br />
                      <strong>Scam type:</strong> {selectedNode.scam_type} <br />
                      <strong>Confidence:</strong> {selectedNode.confidence}% <br />
                      <strong>City:</strong> {selectedNode.city || "Unknown"} <br />
                      <strong>Date:</strong>{" "}
                      {new Date(selectedNode.created_at).toLocaleDateString()} <br />
                      {selectedNode.ring_id && (
                        <>
                          <strong>Fraud ring:</strong> {selectedNode.ring_id} (
                          {selectedNode.ring_size} linked complaints)
                        </>
                      )}
                    </p>
                  </>
                ) : (
                  <p>
                    <strong>Value:</strong> {selectedNode.label} <br />
                    <strong>Linked complaints:</strong>{" "}
                    {countConnections(selectedNode.id)}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="rings-panel">
            <h3>Top Fraud Rings</h3>
            {graphData.rings.length === 0 && (
              <p className="subtitle">No fraud rings detected yet.</p>
            )}
            <ul className="rings-list">
              {graphData.rings.map((ring) => (
                <li
                  key={ring.ring_id}
                  className={`ring-item ${focusedRingId === ring.ring_id ? "active" : ""}`}
                  onClick={() =>
                    setFocusedRingId(focusedRingId === ring.ring_id ? null : ring.ring_id)
                  }
                >
                  <div className="ring-item-header">
                    <strong>{ring.ring_id}</strong>
                    <span className="ring-count">{ring.complaint_count} complaints</span>
                  </div>
                  <div className="ring-item-detail">
                    {ring.phone_count} phone(s), {ring.account_count} account(s)
                  </div>
                  <div className="ring-item-detail">
                    {ring.cities.join(", ") || "Unknown cities"}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
