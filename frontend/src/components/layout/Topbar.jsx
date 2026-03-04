import "./Topbar.css";

const PAGE_LABELS = {
  dashboard: { icon: "⬛", label: "Dashboard"  },
  today:     { icon: "⚡", label: "Today"      },
  habits:    { icon: "🔥", label: "Habits"     },
  chapters:  { icon: "📖", label: "PPP3"       },
  tasks:     { icon: "✅", label: "Tasks"      },
  english:   { icon: "🇬🇧", label: "English"  },
  journal:   { icon: "📓", label: "Journal"    },
};

export default function Topbar({ page, saving }) {
  const { icon, label } = PAGE_LABELS[page] || {};
  const today = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="topbar">
      <div className="topbar-title">
        <span>{icon}</span> {label}
      </div>
      <div className="topbar-date mob-hide">{today}</div>
      <div className={`save-dot ${saving ? "saving" : ""}`} title={saving ? "Saving…" : "All saved"} />
    </div>
  );
}
