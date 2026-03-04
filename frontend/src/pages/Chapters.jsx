import { useState } from "react";
import { useChapters } from "../hooks/useTracker.js";
import { CHAPTERS, DIFF_STYLE, STATUS_STYLE, PART_COLOR } from "../constants/chapters.js";
import { ProgressBar } from "../components/ui/index.jsx";
import { HabitChip }  from "../components/ui/index.jsx";

const TODAY = new Date().toISOString().split("T")[0];
const fmtS = (s) => s ? new Date(s + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" }) : "";
const daysBetween = (a, b) => Math.floor((new Date(b) - new Date(a)) / 86400000);

export default function Chapters() {
  const { chapters, update } = useChapters();
  const [selId, setSelId] = useState(null);

  const sel    = selId ? chapters.find(c => c.id === selId) : null;
  const selDef = selId ? CHAPTERS.find(c => c.id === selId) : null;
  const chDone = chapters.filter(c => c.status === "done").length;

  const setStatus = (id, status) => update(id, { status });

  return (
    <div className="fade-up">
      {/* Overall progress */}
      <div className="card-base mb16">
        <div className="card-bd">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>PPP3 Chapter Progress</div>
              <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 3 }}>Programming: Principles and Practice Using C++ — Bjarne Stroustrup</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontFamily: "var(--mono)", fontSize: 28, fontWeight: 700, color: "var(--gold)", letterSpacing: "-0.02em", textShadow: "0 0 20px rgba(240,168,48,0.2)" }}>{chDone}<span style={{ fontSize: 14, color: "var(--muted)" }}>/21</span></div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>{Math.round(chDone / 21 * 100)}% complete</div>
            </div>
          </div>
          <ProgressBar pct={Math.round(chDone / 21 * 100)} color="var(--gold)" height={10} />
          <div className="mt10" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {["I", "II", "III"].map(p => {
              const chs  = CHAPTERS.filter(c => c.part === p);
              const done = chapters.filter(c => CHAPTERS.find(x => x.id === c.id && x.part === p) && c.status === "done").length;
              return (
                <div key={p} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: PART_COLOR[p] }} />
                  <span style={{ color: "var(--muted)" }}>Part {p}:</span>
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: PART_COLOR[p] }}>{done}/{chs.length}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="g2">
        {/* Chapter list */}
        <div className="card-base">
          <div className="card-hd"><span className="section-title">📚 All 21 Chapters</span></div>
          <div style={{ padding: "8px 10px", maxHeight: 510, overflowY: "auto" }}>
            {["I", "II", "III"].map(part => {
              const partChaps = CHAPTERS.filter(c => c.part === part);
              const partDone  = chapters.filter(c => partChaps.find(x => x.id === c.id) && c.status === "done").length;
              return (
                <div key={part}>
                  <div className="part-header">
                    <span style={{ color: PART_COLOR[part] }}>Part {part}</span>
                    <span>{partDone}/{partChaps.length} done</span>
                  </div>
                  {partChaps.map(def => {
                    const state = chapters.find(c => c.id === def.id) || {};
                    const ss    = STATUS_STYLE[state.status || "todo"];
                    const ds    = DIFF_STYLE[def.diff];
                    return (
                      <div key={def.id} className={`ch-row ${selId === def.id ? "selected" : ""}`} onClick={() => setSelId(selId === def.id ? null : def.id)}>
                        <div className="ch-num" style={{ background: ss.bg, borderColor: ss.border, color: ss.color }}>{def.id}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="ch-title">{def.title}</div>
                          <div className="ch-sub">Days {def.days}{state.endDate ? ` · Done ${fmtS(state.endDate)}` : ""}</div>
                        </div>
                        <div className="diff-badge" style={{ background: ds.bg, color: ds.color }}>{def.diff}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Detail panel */}
        <div className="card-base">
          {sel && selDef ? (
            <div>
              <div className="card-hd">
                <span className="section-title">Chapter {sel.id} · Details</span>
                <button className="icon-btn" onClick={() => setSelId(null)}>✕</button>
              </div>
              <div className="card-bd">
                <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 3 }}>{selDef.title}</div>
                <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 14 }}>{selDef.topics}</div>

                {/* Status */}
                <div className="mb14">
                  <div className="lbl">Status</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["todo", "active", "done"].map(s => {
                      const ss  = STATUS_STYLE[s];
                      const act = sel.status === s;
                      return (
                        <button key={s} className="status-chip" onClick={() => setStatus(sel.id, s)}
                          style={{ background: act ? ss.bg : "transparent", borderColor: act ? ss.border : "var(--border2)", color: act ? ss.color : "var(--muted)" }}>
                          {ss.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Dates */}
                <div className="g2 mb14">
                  <div>
                    <div className="lbl">Start Date</div>
                    <input type="date" value={sel.startDate || ""}
                      onChange={e => update(sel.id, { startDate: e.target.value })} />
                  </div>
                  <div>
                    <div className="lbl">End Date</div>
                    <input type="date" value={sel.endDate || ""}
                      onChange={e => update(sel.id, { endDate: e.target.value })} />
                  </div>
                </div>

                {/* Exercises done */}
                <div className="mb14">
                  <HabitChip icon="✏️" label="All exercises & drills completed" done={sel.exercisesDone}
                    onClick={() => update(sel.id, { exercisesDone: !sel.exercisesDone })} />
                </div>

                {/* Notes */}
                <div className="lbl">Notes & Exercises Done</div>
                <textarea placeholder="Which exercises did you finish? What was confusing? Key concepts..."
                  value={sel.notes}
                  onChange={e => update(sel.id, { notes: e.target.value })}
                  style={{ minHeight: 120 }} />

                {/* Duration */}
                {sel.startDate && sel.endDate && (
                  <div className="mt12" style={{ padding: "9px 13px", background: "var(--green-gl)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "var(--rs)", fontSize: 12, color: "var(--green)" }}>
                    ✅ Completed in {daysBetween(sel.startDate, sel.endDate) + 1} day{daysBetween(sel.startDate, sel.endDate) > 0 ? "s" : ""}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📖</div>
              <div>Click any chapter to view details,<br />update status and add notes</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
