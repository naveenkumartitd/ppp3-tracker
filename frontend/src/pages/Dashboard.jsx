import { useEffect, useState } from "react";
import StatCard from "../components/ui/StatCard.jsx";
import { ProgressBar, HabitChip } from "../components/ui/index.jsx";
import { useHabits, useChapters, useTasks } from "../hooks/useTracker.js";
import { ppp3Api, engApi, aptApi } from "../api/client.js";
import { habitsApi } from "../api/client.js";
import { HABITS } from "../constants/habits.js";
import { CHAPTERS } from "../constants/chapters.js";

const TODAY = new Date().toISOString().split("T")[0];
const fmtWeekday = (d) => new Date(d + "T00:00:00").toLocaleDateString("en", { weekday: "short" });

export default function Dashboard({ setPage, streak, dayNum }) {
  const { habits, toggle } = useHabits(TODAY);
  const { chapters }       = useChapters();
  const { tasks }          = useTasks();

  const [totals, setTotals]   = useState({ words: 0, questions: 0, hours: 0 });
  const [weekGrid, setWeekGrid] = useState({});

  useEffect(() => {
    // Load aggregate totals
    Promise.all([ppp3Api.getAll(), engApi.getAll(), aptApi.getAll()]).then(([logs, eng, apt]) => {
      setTotals({
        hours:     logs.reduce((a, b) => a + (b.hours || 0), 0),
        words:     eng.reduce((a, b) => a + (b.words || 0), 0),
        questions: apt.reduce((a, b) => a + (b.questions || 0), 0),
      });
    });
    // Load last 7 days for habit bar chart
    habitsApi.getRange(7).then(setWeekGrid);
  }, []);

  const chDone   = chapters.filter(c => c.status === "done").length;
  const taskDone = tasks.filter(t => t.status === "done").length;
  const hDone    = HABITS.filter(h => habits[h.id]).length;
  const pct70    = Math.min(100, Math.round(dayNum / 70 * 100));
  const pctCh    = Math.round(chDone / 21 * 100);
  const activeC  = chapters.find(c => c.status === "active");
  const activeChapterDef = activeC ? CHAPTERS.find(c => c.id === activeC.id) : null;

  const last7 = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const k = d.toISOString().split("T")[0];
    return { k, label: k === TODAY ? "Today" : fmtWeekday(k), count: HABITS.filter(h => (weekGrid[k] || {})[h.id]).length };
  });

  return (
    <div className="fade-up">
      {/* Stats */}
      <div className="g-stat">
        <StatCard label="Day"        value={dayNum}         sub={`of 70  (${pct70}%)`}        color="var(--gold)"  pct={pct70} />
        <StatCard label="Streak"     value={`${streak} days`} sub="days in a row 🔥"          color="var(--red)"   pct={Math.min(100, streak * 5)} />
        <StatCard label="Chapters"   value={`${chDone}/21`} sub={`${pctCh}% complete`}        color="var(--blue2)" pct={pctCh} />
        <StatCard label="Tasks Done" value={taskDone}       sub={`of ${tasks.length} total`}   color="var(--green)" pct={Math.round(taskDone / (tasks.length || 1) * 100)} />
      </div>

      <div className="g2">
        {/* Left */}
        <div className="col">
          {/* Active chapter */}
          {activeChapterDef && (
            <div className="card-base">
              <div className="card-hd"><span className="section-title">📖 Currently Reading</span></div>
              <div className="card-bd">
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 12, background: "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(59,130,246,0.06))", border: "1px solid rgba(59,130,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700, color: "var(--blue2)", flexShrink: 0, boxShadow: "0 2px 10px rgba(59,130,246,0.15)" }}>
                    {activeChapterDef.id}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{activeChapterDef.title}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>Part {activeChapterDef.part} · Days {activeChapterDef.days}</div>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{activeChapterDef.topics}</div>
                  </div>
                </div>
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--muted)", marginBottom: 6 }}>
                    <span>Chapter progress</span>
                    <span style={{ color: "var(--blue2)", fontFamily: "var(--mono)", fontWeight: 700 }}>{chDone}/21</span>
                  </div>
                  <ProgressBar pct={pctCh} color="var(--blue2)" />
                </div>
              </div>
            </div>
          )}

          {/* 7-day habit bars */}
          <div className="card-base">
            <div className="card-hd"><span className="section-title">🔥 Last 7 Days</span></div>
            <div className="card-bd">
              {last7.map(day => {
                const col = day.count >= 6 ? "var(--green)" : day.count >= 4 ? "var(--gold)" : "var(--red)";
                return (
                  <div key={day.k} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
                    <div style={{ width: 34, fontSize: 11, color: day.k === TODAY ? "var(--gold)" : "var(--muted)", fontWeight: day.k === TODAY ? 700 : 400 }}>{day.label}</div>
                    <div style={{ flex: 1 }}><ProgressBar pct={Math.round(day.count / 8 * 100)} color={col} height={7} /></div>
                    <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--muted)", width: 22, textAlign: "right" }}>{day.count}/8</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="col">
          {/* Quick numbers */}
          <div className="g3">
            {[
              { ico: "⏱", lbl: "PPP3 Hours",    val: totals.hours.toFixed(1), c: "var(--purple)" },
              { ico: "📝", lbl: "Words Learned", val: totals.words,            c: "var(--gold)"   },
              { ico: "🧮", lbl: "Aptitude Q's",  val: totals.questions,        c: "var(--orange)" },
            ].map(s => (
              <div key={s.lbl} className="card-base" style={{ padding: 18, textAlign: "center", transition: "all 0.25s" }}>
                <div style={{ fontSize: 20, marginBottom: 6, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>{s.ico}</div>
                <div style={{ fontFamily: "var(--mono)", fontSize: 24, fontWeight: 700, color: s.c, letterSpacing: "-0.02em" }}>{s.val}</div>
                <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4, fontWeight: 600 }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          {/* Today habit grid */}
          <div className="card-base">
            <div className="card-hd">
              <span className="section-title">⚡ Today's Habits</span>
              <button className="btn-base btn-ghost btn-sm" onClick={() => setPage("today")}>Open Today →</button>
            </div>
            <div className="card-bd">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: "var(--muted)" }}>Completed</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 700, color: hDone === 8 ? "var(--green)" : "var(--gold)" }}>{hDone}/8</span>
              </div>
              <ProgressBar pct={hDone / 8 * 100} color={hDone === 8 ? "var(--green)" : "var(--gold)"} />
              <div className="g4" style={{ marginTop: 14 }}>
                {HABITS.map(h => {
                  const on = !!habits[h.id];
                  return (
                    <div key={h.id} onClick={() => toggle(h.id)}
                      title={h.label}
                      style={{ padding: "10px 4px", borderRadius: "var(--rs)", background: on ? "linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.04))" : "var(--card2)", border: `1px solid ${on ? "rgba(34,197,94,0.25)" : "var(--border)"}`, textAlign: "center", cursor: "pointer", transition: "all 0.2s", boxShadow: on ? "0 2px 8px rgba(34,197,94,0.1)" : "none" }}>
                      <div style={{ fontSize: 18 }}>{h.icon}</div>
                      <div style={{ fontSize: 8, color: on ? "var(--green)" : "var(--muted2)", marginTop: 3, fontWeight: 700 }}>{on ? "✓ Done" : "○"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active tasks */}
          <div className="card-base">
            <div className="card-hd">
              <span className="section-title">✅ Active Tasks</span>
              <button className="btn-base btn-ghost btn-sm" onClick={() => setPage("tasks")}>All →</button>
            </div>
            <div className="card-bd">
              {tasks.filter(t => t.status === "active").slice(0, 4).map(t => (
                <div key={t.id} style={{ display: "flex", gap: 10, paddingBottom: 9, marginBottom: 9, borderBottom: "1px solid var(--border)" }}>
                  <div style={{ width: 6, height: 6, borderRadius: 3, background: "var(--blue2)", marginTop: 5, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{t.text}</div>
                    <span className={`tag tag-${t.cat.toLowerCase()}`}>{t.cat}</span>
                  </div>
                </div>
              ))}
              {tasks.filter(t => t.status === "active").length === 0 && (
                <div style={{ fontSize: 12, color: "var(--muted)", textAlign: "center", padding: "12px 0" }}>No active tasks yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 22px", background: "linear-gradient(135deg, var(--card) 0%, rgba(14,20,32,0.6) 100%)", border: "1px solid var(--border)", borderRadius: "var(--r)", textAlign: "center", marginTop: 16 }}>
        <span style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic", lineHeight: 1.8 }}>
          💬 &nbsp;"The best time to start was years ago. The second best time is&nbsp;
          <strong style={{ color: "var(--gold)", textShadow: "0 0 20px rgba(240,168,48,0.3)" }}>right now.</strong>"
        </span>
      </div>
    </div>
  );
}
