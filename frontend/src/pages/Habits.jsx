import StatCard from "../components/ui/StatCard.jsx";
import { HabitChip } from "../components/ui/index.jsx";
import { useHabits, useHabitGrid } from "../hooks/useTracker.js";
import { HABITS } from "../constants/habits.js";

const TODAY = new Date().toISOString().split("T")[0];

export default function Habits({ streak }) {
  const { habits, toggle } = useHabits(TODAY);
  const { grid, toggle: gridToggle } = useHabitGrid(21);

  const last21 = [...Array(21)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (20 - i));
    return d.toISOString().split("T")[0];
  });

  const todayCount = HABITS.filter(h => habits[h.id]).length;
  const tracked    = Object.keys(grid).length;

  return (
    <div className="fade-up">
      <div className="g-stat">
        <StatCard label="Current Streak" value={`${streak} days`} color="var(--gold)" />
        <StatCard label="Today"          value={`${todayCount}/8`} color="var(--green)" />
        <StatCard label="Days Tracked"   value={tracked}            color="var(--blue2)" />
        <StatCard label="Best (21 days)" value={`${Math.max(...last21.map(k => HABITS.filter(h => (grid[k] || {})[h.id]).length), 0)}/8`} color="var(--purple)" />
      </div>

      {/* 21-day grid */}
      <div className="card-base mb16">
        <div className="card-hd">
          <span className="section-title">📅 21-Day Habit Grid</span>
          <span style={{ fontSize: 10, color: "var(--muted)" }}>Click to toggle · Colour = done</span>
        </div>
        <div className="card-bd" style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 540 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "5px 8px", fontSize: 10, color: "var(--muted)", fontWeight: 700, width: 110 }}>Habit</th>
                {last21.map(d => {
                  const dt = new Date(d + "T00:00:00");
                  const isToday = d === TODAY;
                  const isSun   = dt.getDay() === 0;
                  return (
                    <th key={d} style={{ padding: "3px 2px", fontSize: 9, color: isToday ? "var(--gold)" : isSun ? "var(--muted)" : "var(--muted2)", fontWeight: isToday ? 700 : 400, textAlign: "center", minWidth: 24 }}>
                      {dt.toLocaleDateString("en", { weekday: "short" }).charAt(0)}
                      <br />
                      <span style={{ fontFamily: "var(--mono)" }}>{dt.getDate()}</span>
                    </th>
                  );
                })}
                <th style={{ padding: "5px 8px", fontSize: 10, color: "var(--muted)", textAlign: "center", width: 30 }}>✓</th>
              </tr>
            </thead>
            <tbody>
              {HABITS.map(h => (
                <tr key={h.id}>
                  <td style={{ padding: "4px 8px", fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>{h.icon} {h.label}</td>
                  {last21.map(d => {
                    const on     = (grid[d] || {})[h.id];
                    const future = d > TODAY;
                    return (
                      <td key={d} style={{ padding: "3px 2px", textAlign: "center" }}>
                        <div
                          className={`heat-cell ${future ? "future" : ""}`}
                          onClick={() => !future && gridToggle(d, h.id)}
                          style={{
                            background:   on ? h.color : future ? "transparent" : "var(--card2)",
                            borderColor:  on ? h.color + "55" : future ? "transparent" : "var(--border)",
                            color:        on ? "#000" : "transparent",
                            opacity:      future ? 0.18 : 1,
                          }}
                        >
                          {on ? "✓" : ""}
                        </div>
                      </td>
                    );
                  })}
                  <td style={{ padding: "4px 8px", textAlign: "center", fontFamily: "var(--mono)", fontSize: 11, color: "var(--green)", fontWeight: 700 }}>
                    {last21.filter(d => (grid[d] || {})[h.id]).length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick toggle today */}
      <div className="card-base">
        <div className="card-hd"><span className="section-title">⚡ Toggle Today</span></div>
        <div className="card-bd" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {HABITS.map(h => (
            <HabitChip key={h.id} icon={h.icon} label={h.label} done={!!habits[h.id]} onClick={() => toggle(h.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}
