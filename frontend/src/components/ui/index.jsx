import "./ui.css";
import StatCard from "./StatCard.jsx";

export { StatCard };

export function Card({ children, className = "", style = {} }) {
  return (
    <div className={`card-base ${className}`} style={style}>
      {children}
    </div>
  );
}

export function CardHeader({ title, right }) {
  return (
    <div className="card-hd">
      <span className="section-title">{title}</span>
      {right && <div>{right}</div>}
    </div>
  );
}

export function CardBody({ children, style = {} }) {
  return <div className="card-bd" style={style}>{children}</div>;
}

export function ProgressBar({ pct, color = "var(--gold)", height = 6, style = {} }) {
  return (
    <div className="prog-track" style={{ height, ...style }}>
      <div className="prog-fill" style={{ width: `${pct}%`, background: color, height: "100%", borderRadius: 4, transition: "width 0.4s ease" }} />
    </div>
  );
}

export function HabitChip({ icon, label, done, onClick }) {
  return (
    <div className={`h-chip ${done ? "on" : ""}`} onClick={onClick}>
      <div className="h-dot">{done ? "✓" : ""}</div>
      <span style={{ fontSize: 15 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 500 }}>{label}</span>
    </div>
  );
}

export function FilterPill({ label, active, onClick, count }) {
  return (
    <button className={`fp ${active ? "on" : ""}`} onClick={onClick}>
      {label}
      {count !== undefined && <span style={{ marginLeft: 4, opacity: 0.55 }}>{count}</span>}
    </button>
  );
}

export function EmptyState({ icon = "📭", message = "Nothing here yet" }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div>{message}</div>
    </div>
  );
}

export function Button({ children, variant = "ghost", size = "md", onClick, disabled, style = {} }) {
  const cls = [
    "btn-base",
    variant === "primary" ? "btn-primary" : "btn-ghost",
    size === "sm" ? "btn-sm" : "",
  ].filter(Boolean).join(" ");

  return (
    <button className={cls} onClick={onClick} disabled={disabled} style={style}>
      {children}
    </button>
  );
}

export function IconButton({ children, onClick, style = {}, danger }) {
  return (
    <button className={`icon-btn ${danger ? "danger" : ""}`} onClick={onClick} style={style}>
      {children}
    </button>
  );
}

export function CheckRound({ done, onClick }) {
  return (
    <div className={`check-round ${done ? "checked" : ""}`} onClick={onClick}>
      {done ? "✓" : ""}
    </div>
  );
}

export function CheckSquare({ done, active, onClick }) {
  const cls = done ? "check-sq checked" : active ? "check-sq active" : "check-sq";
  return (
    <div className={cls} onClick={onClick}>
      {done ? "✓" : active ? "▶" : "○"}
    </div>
  );
}
