import { useState, useEffect } from "react";
import { useHabits, useAutoSave } from "../hooks/useTracker.js";
import { scheduleApi, ppp3Api } from "../api/client.js";
import { HABITS } from "../constants/habits.js";
import { DEFAULT_SCHEDULE } from "../constants/schedule.js";
import { HabitChip, CheckRound, ProgressBar } from "../components/ui/index.jsx";
import { useChapters } from "../hooks/useTracker.js";
import { CHAPTERS } from "../constants/chapters.js";

const TODAY = new Date().toISOString().split("T")[0];
const isSun = new Date().getDay() === 0;

export default function Today({ setSaving }) {
  const { habits, toggle, count: hDone } = useHabits(TODAY);
  const { chapters } = useChapters();

  const [sched,   setSched]   = useState({});
  const [customs, setCustoms] = useState([]);
  const [pppLog,  setPppLog]  = useState({ hours: "", note: "" });
  const [newTask, setNewTask] = useState("");

  const activeC = chapters.find(c => c.status === "active");
  const chDef   = activeC ? CHAPTERS.find(c => c.id === activeC.id) : null;

  // Load schedule data
  useEffect(() => {
    scheduleApi.getDate(TODAY).then(data => {
      setSched(data.scheduleItems || {});
      setCustoms(data.customTasks || []);
    });
    ppp3Api.getDate(TODAY).then(data => {
      setPppLog({ hours: data.hours || "", note: data.note || "" });
    });
  }, []);

  // Auto-save PPP3 log
  const { saving } = useAutoSave(pppLog, (data) => ppp3Api.save(TODAY, data));
  useEffect(() => { setSaving(saving); }, [saving, setSaving]);

  const toggleSched = async (itemId) => {
    const cur = !!sched[itemId];
    setSched(prev => ({ ...prev, [itemId]: !cur }));
    await scheduleApi.toggleItem(TODAY, itemId, !cur);
  };

  const addCustom = async () => {
    if (!newTask.trim()) return;
    const created = await scheduleApi.addCustom(TODAY, newTask.trim());
    setCustoms(prev => [...prev, created]);
    setNewTask("");
  };

  const toggleCustom = async (id) => {
    const t = customs.find(c => c.id === id);
    setCustoms(prev => prev.map(c => c.id === id ? { ...c, done: !c.done } : c));
    await scheduleApi.toggleCustom(TODAY, id, !t.done);
  };

  const delCustom = async (id) => {
    setCustoms(prev => prev.filter(c => c.id !== id));
    await scheduleApi.deleteCustom(TODAY, id);
  };

  const schedDone = DEFAULT_SCHEDULE.filter(s => sched[s.id]).length;

  return (
    <div className="fade-up">
      {hDone === 8 && (
        <div className="congrats-banner">
          <div className="icon">🎉</div>
          <div>
            <div className="title">Perfect Day! All 8 habits done!</div>
            <div className="sub">Champions are built on days like this.</div>
          </div>
        </div>
      )}

      {/* Chapter banner */}
      {chDef && (
        <div className="chapter-banner">
          <div className="num">{chDef.id}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>
              Now Reading · {isSun ? "🌟 SUNDAY — POWER DAY (10+ hrs)" : "🔷 WEEKDAY (4.5 hrs)"}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{chDef.title}</div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>Part {chDef.part} · Days {chDef.days}</div>
          </div>
          <div style={{ flexShrink: 0, textAlign: "right" }}>
            <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>PPP3 hrs today</div>
            <input type="number" min="0" max="12" step="0.5"
              value={pppLog.hours}
              onChange={e => setPppLog(p => ({ ...p, hours: e.target.value }))}
              placeholder="0.0"
              style={{ width: 70, textAlign: "center", fontFamily: "var(--mono)", fontSize: 18, fontWeight: 700, color: "var(--gold)", background: "rgba(232,160,32,0.07)", border: "1px solid rgba(232,160,32,0.2)" }} />
          </div>
        </div>
      )}

      <div className="g2">
        {/* Schedule + custom */}
        <div className="card-base">
          <div className="card-hd">
            <span className="section-title">⏰ Today's Schedule</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--green)", fontWeight: 700 }}>{schedDone}/{DEFAULT_SCHEDULE.length}</span>
          </div>
          <div className="card-bd">
            <ProgressBar pct={schedDone / DEFAULT_SCHEDULE.length * 100} color="var(--green)" height={4} style={{ marginBottom: 14 }} />

            {DEFAULT_SCHEDULE.map(s => (
              <div key={s.id} className={`sched-row ${sched[s.id] ? "done" : ""}`}>
                <CheckRound done={!!sched[s.id]} onClick={() => toggleSched(s.id)} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 1 }} className="sched-main">
                    <span className="sched-time">{s.time}</span>
                    <span style={{ fontSize: 13 }}>{s.icon}</span>
                    <span className="sched-label">{s.label}</span>
                  </div>
                  <div className="sched-desc sched-main">{s.desc}</div>
                </div>
              </div>
            ))}

            {/* Custom tasks */}
            <div className="divider" />
            <div className="section-title" style={{ marginBottom: 8 }}>📌 My Extra Tasks Today</div>

            {customs.map(t => (
              <div key={t.id} className="ct-row">
                <CheckRound done={t.done} onClick={() => toggleCustom(t.id)} />
                <span className={`ct-text ${t.done ? "done" : ""}`}>{t.text}</span>
                <button className="icon-btn danger" onClick={() => delCustom(t.id)}>✕</button>
              </div>
            ))}

            <div className="input-row mt8">
              <input
                placeholder="Add a task for today only…"
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addCustom()}
              />
              <button className="btn-base btn-primary btn-sm" onClick={addCustom}>+ Add</button>
            </div>
          </div>
        </div>

        {/* Habits + learning note */}
        <div className="col">
          <div className="card-base">
            <div className="card-hd">
              <span className="section-title">🔥 Today's Habits</span>
              <span style={{ fontFamily: "var(--mono)", fontSize: 14, fontWeight: 700, color: hDone === 8 ? "var(--green)" : "var(--gold)" }}>{hDone}/8</span>
            </div>
            <div className="card-bd">
              <ProgressBar pct={hDone / 8 * 100} color={hDone === 8 ? "var(--green)" : "var(--gold)"} style={{ marginBottom: 12 }} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
                {HABITS.map(h => (
                  <HabitChip key={h.id} icon={h.icon} label={h.label} done={!!habits[h.id]} onClick={() => toggle(h.id)} />
                ))}
              </div>
            </div>
          </div>

          <div className="card-base">
            <div className="card-hd"><span className="section-title">📝 Today's Learning Note</span></div>
            <div className="card-bd">
              <textarea
                placeholder="What clicked today? What was hard? Key concept learned?"
                value={pppLog.note}
                onChange={e => setPppLog(p => ({ ...p, note: e.target.value }))}
                style={{ minHeight: 100 }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
