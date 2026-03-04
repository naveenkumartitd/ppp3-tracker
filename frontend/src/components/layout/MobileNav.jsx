import "./MobileNav.css";

const NAV = [
  { id: "dashboard", icon: "⬛", label: "Home"    },
  { id: "today",     icon: "⚡", label: "Today"   },
  { id: "habits",    icon: "🔥", label: "Habits"  },
  { id: "chapters",  icon: "📖", label: "PPP3"    },
  { id: "tasks",     icon: "✅", label: "Tasks"   },
  { id: "english",   icon: "🇬🇧", label: "Eng"   },
  { id: "journal",   icon: "📓", label: "Journal" },
];

export default function MobileNav({ page, setPage }) {
  return (
    <div className="mobile-nav">
      <div className="mob-grid">
        {NAV.map(n => (
          <button
            key={n.id}
            className={`mob-btn ${page === n.id ? "active" : ""}`}
            onClick={() => setPage(n.id)}
          >
            <span className="mob-icon">{n.icon}</span>
            <span className="mob-label">{n.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
