import "./Sidebar.css";

const NAV = [
  { id: "dashboard", icon: "⬛", label: "Dashboard" },
  { id: "today",     icon: "⚡", label: "Today"     },
  { id: "habits",    icon: "🔥", label: "Habits"    },
  { id: "chapters",  icon: "📖", label: "PPP3"      },
  { id: "tasks",     icon: "✅", label: "Tasks"     },
  { id: "english",   icon: "🇬🇧", label: "English" },
  { id: "journal",   icon: "📓", label: "Journal"   },
];

export default function Sidebar({ page, setPage, dayNum, streak, saving, tasksDone }) {
  return (
    <aside className="sidebar">
      <div className="sb-logo">
        <div className="sb-mark">P3</div>
        <div>
          <div className="sb-name">PPP3 Tracker</div>
          <div className="sb-sub">Day {dayNum} of 70</div>
        </div>
      </div>

      <nav className="sb-nav">
        <div className="sb-section">Navigation</div>
        {NAV.map(n => (
          <div
            key={n.id}
            className={`sb-item ${page === n.id ? "active" : ""}`}
            onClick={() => setPage(n.id)}
          >
            <span className="sb-icon">{n.icon}</span>
            <span>{n.label}</span>
            {n.id === "tasks" && tasksDone > 0 && (
              <span className="sb-badge">{tasksDone}</span>
            )}
          </div>
        ))}
      </nav>

      <div className="sb-foot">
        <div className="streak-pill">🔥 {streak} day streak</div>
        <div
          className={`save-dot ${saving ? "saving" : ""}`}
          title={saving ? "Saving…" : "All saved"}
        />
      </div>
    </aside>
  );
}
