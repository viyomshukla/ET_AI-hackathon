// Small reusable loading indicator, used instead of plain "Loading..." text
// on pages that fetch data (Network Graph, Crime Map).
export default function Spinner({ label = "Loading..." }) {
  return (
    <div className="spinner-wrapper">
      <div className="spinner" />
      <span>{label}</span>
    </div>
  );
}
