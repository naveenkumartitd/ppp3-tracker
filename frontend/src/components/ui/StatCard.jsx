import "./StatCard.css";

export default function StatCard({ label, value, sub, color = "var(--gold)", pct }) {
  return (
    <div className="stat-card">
      <div className="stat-accent" style={{ background: color }} />
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={{ color }}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
      {pct !== undefined && (
        <div className="stat-bar">
          <div className="stat-bar-fill" style={{ width: `${pct}%`, background: color }} />
        </div>
      )}
    </div>
  );
}
