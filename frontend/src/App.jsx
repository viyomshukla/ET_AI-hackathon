import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import FraudShield from "./pages/FraudShield.jsx";
import NetworkGraph from "./pages/NetworkGraph.jsx";
import CrimeMap from "./pages/CrimeMap.jsx";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="page-content">
        <Routes>
          <Route path="/" element={<FraudShield />} />
          <Route path="/graph" element={<NetworkGraph />} />
          <Route path="/map" element={<CrimeMap />} />
        </Routes>
      </main>
    </div>
  );
}
