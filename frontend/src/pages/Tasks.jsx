import { useState } from "react";
import { useTasks } from "../hooks/useTracker.js";
import { FilterPill, EmptyState } from "../components/ui/index.jsx";

const CATS = ["PPP3", "Habits", "English", "Aptitude", "Community", "Java"];

export default function Tasks() {
  const { tasks, add, update, remove, cycleStatus } = useTasks();

  const [statusF, setStatusF] = useState("all");
  const [catF,    setCatF]    = useState("all");
  const [editId,  setEditId]  = useState(null);
  const [newText, setNewText] = useState("");
  const [newCat,  setNewCat]  = useState("PPP3");
  const [newPri,  setNewPri]  = useState("medium");
  const [newDay,  setNewDay]  = useState("");

  const shown = tasks
    .filter(t => catF === "all"    || t.cat    === catF)
    .filter(t => statusF === "all" || t.status === statusF);

  const counts = {
    all:    tasks.length,
    todo:   tasks.filter(t => t.status === "todo").length,
    active: tasks.filter(t => t.status === "active").length,
    done:   tasks.filter(t => t.status === "done").length,
  };

  const handleAdd = () => {
    if (!newText.trim()) return;
    add({ cat: newCat, text: newText.trim(), priority: newPri, targetDay: parseInt(newDay) || null });
    setNewText(""); setNewDay("");
  };

  const stIcon  = { todo: "○", active: "▶", done: "✓" };
  const stColor = { todo: "var(--border2)", active: "var(--blue)", done: "var(--green)" };

  return (
    <div className="fade-up">
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        {[["All", counts.all, "var(--muted)", "all"], ["To Do", counts.todo, "var(--gold)", "todo"], ["Active", counts.active, "var(--blue2)", "active"], ["Done", counts.done, "var(--green)", "done"]].map(([l, v, c, f]) => (
          <div key={l} className="card-base"
            style={{ padding: 18, textAlign: "center", cursor: "pointer", borderColor: statusF === f ? "rgba(240,168,48,0.25)" : "var(--border)", transition: "all 0.2s", transform: statusF === f ? "translateY(-2px)" : "none", boxShadow: statusF === f ? "0 4px 14px rgba(0,0,0,0.2)" : "none" }}
            onClick={() => setStatusF(f)}>
            <div style={{ fontFamily: "var(--mono)", fontSize: 26, fontWeight: 700, color: c, letterSpacing: "-0.02em" }}>{v}</div>
            <div style={{ fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4, fontWeight: 600 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Add task */}
      <div className="card-base mb14">
        <div className="card-hd"><span className="section-title">+ New Task</span></div>
        <div className="card-bd">
          <input placeholder="Task description…" value={newText}
            onChange={e => setNewText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            style={{ marginBottom: 8 }} />
          <div className="input-row">
            <select value={newCat} onChange={e => setNewCat(e.target.value)} style={{ flex: 1 }}>
              {CATS.map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={newPri} onChange={e => setNewPri(e.target.value)} style={{ flex: 1 }}>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
            <input type="number" placeholder="Day #" value={newDay}
              onChange={e => setNewDay(e.target.value)} style={{ width: 80 }} />
            <button className="btn-base btn-primary" onClick={handleAdd}>Add</button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <div className="fpill">
          {["all", "todo", "active", "done"].map(f => (
            <FilterPill key={f} label={f === "all" ? "All" : f === "todo" ? "To Do" : f === "active" ? "Active" : "Done"}
              active={statusF === f} onClick={() => setStatusF(f)} count={counts[f]} />
          ))}
        </div>
        <div className="fpill">
          <FilterPill label="All" active={catF === "all"} onClick={() => setCatF("all")} />
          {CATS.map(c => <FilterPill key={c} label={c} active={catF === c} onClick={() => setCatF(c)} />)}
        </div>
      </div>

      {/* Task list */}
      {shown.length === 0 ? (
        <EmptyState icon="✅" message="No tasks here" />
      ) : shown.map(t => (
        <div key={t.id} className={`task-row ${t.status === "done" ? "done" : ""}`}>
          {/* Status toggle */}
          <div className={`check-sq ${t.status === "done" ? "checked" : t.status === "active" ? "active" : ""}`}
            style={{ color: t.status === "done" ? "#000" : t.status === "active" ? "var(--blue2)" : "transparent" }}
            onClick={() => cycleStatus(t.id)}>
            {stIcon[t.status]}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            {editId === t.id ? (
              <input className="inline-edit" defaultValue={t.text} autoFocus
                onBlur={e => { update(t.id, { text: e.target.value }); setEditId(null); }}
                onKeyDown={e => { if (e.key === "Enter") { update(t.id, { text: e.target.value }); setEditId(null); } }} />
            ) : (
              <div className="task-text" onDoubleClick={() => setEditId(t.id)}>{t.text}</div>
            )}
            <div className="task-meta">
              <span className={`tag tag-${t.cat.toLowerCase()}`}>{t.cat}</span>
              <span className={`tag tag-${t.priority}`}>{t.priority}</span>
              {t.targetDay && <span style={{ fontSize: 10, color: "var(--muted)" }}>Day {t.targetDay}</span>}
              <span style={{ fontSize: 9, color: "var(--muted2)", marginLeft: "auto" }}>double-click to edit</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 5, flexShrink: 0, alignItems: "flex-start" }}>
            <select value={t.priority} onChange={e => update(t.id, { priority: e.target.value })}
              style={{ width: 86, fontSize: 11, padding: "3px 6px" }}>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Med</option>
              <option value="low">🟢 Low</option>
            </select>
            <button className="icon-btn danger" onClick={() => remove(t.id)}>🗑</button>
          </div>
        </div>
      ))}
    </div>
  );
}
