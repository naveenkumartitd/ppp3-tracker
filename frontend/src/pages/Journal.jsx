import { useState, useEffect } from "react";
import { journalApi, ppp3Api } from "../api/client.js";
import { useAutoSave } from "../hooks/useTracker.js";

const TODAY = new Date().toISOString().split("T")[0];
const fmtDate  = (s) => new Date(s + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const PROMPTS = [
  { k: "did",      color: "var(--blue2)",  emoji: "⚡", label: "One thing I did well today"   },
  { k: "learned",  color: "var(--gold)",   emoji: "💡", label: "One thing I learned today"    },
  { k: "grateful", color: "var(--purple)", emoji: "🙏", label: "One thing I am grateful for"  },
];

export default function Journal({ setSaving }) {
  const [selDate,   setSelDate]   = useState(TODAY);
  const [entry,     setEntry]     = useState({ did: "", learned: "", grateful: "" });
  const [allDates,  setAllDates]  = useState([TODAY]);
  const [totalHrs,  setTotalHrs]  = useState(0);
  const [studyDays, setStudyDays] = useState(0);

  useEffect(() => {
    journalApi.getAll().then(entries => {
      const dates = [...new Set([TODAY, ...entries.map(e => e.date)])].sort((a, b) => b.localeCompare(a));
      setAllDates(dates);
    });
    ppp3Api.getAll().then(logs => {
      setTotalHrs(logs.reduce((a, b) => a + (b.hours || 0), 0));
      setStudyDays(logs.filter(l => l.hours > 0).length);
    });
  }, []);

  useEffect(() => {
    journalApi.getDate(selDate).then(setEntry);
  }, [selDate]);

  const { saving } = useAutoSave(entry, (data) => journalApi.save(selDate, data));
  useEffect(() => { setSaving(saving); }, [saving, setSaving]);

  const filled = allDates.filter(d => d !== TODAY).length; // approx

  return (
    <div className="fade-up">
      <div className="g3 mb16">
        {[
          { ico: "📓", lbl: "Journal Entries", val: filled,              c: "var(--purple)" },
          { ico: "⏱",  lbl: "Study Days",       val: studyDays,           c: "var(--gold)"   },
          { ico: "🕐",  lbl: "Total Hours",      val: totalHrs.toFixed(1), c: "var(--green)"  },
        ].map(s => (
          <div key={s.lbl} className="card-base" style={{ padding: 18, textAlign: "center", transition: "all 0.25s" }}>
            <div style={{ fontSize: 22, marginBottom: 6, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>{s.ico}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 26, fontWeight: 700, color: s.c, letterSpacing: "-0.02em" }}>{s.val}</div>
            <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4, fontWeight: 600 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      <div className="g2">
        {/* Date list */}
        <div className="card-base">
          <div className="card-hd">
            <span className="section-title">📅 All Entries</span>
          </div>
          <div style={{ padding: 8, maxHeight: 460, overflowY: "auto" }}>
            {allDates.map(d => {
              const isToday = d === TODAY;
              const isSel   = d === selDate;
              return (
                <div key={d} onClick={() => setSelDate(d)}
                  style={{ padding: "9px 12px", borderRadius: "var(--rs)", cursor: "pointer", marginBottom: 3, background: isSel ? "var(--card2)" : "transparent", border: `1px solid ${isSel ? "var(--border2)" : "transparent"}`, transition: "all 0.15s" }}>
                  <div style={{ fontSize: 13, fontWeight: isToday ? 700 : 500, color: isToday ? "var(--gold)" : "var(--text)" }}>
                    {isToday ? "Today" : fmtDate(d)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Editor */}
        <div className="card-base">
          <div className="card-hd">
            <span className="section-title">{selDate === TODAY ? "✍ Tonight's Journal" : fmtDate(selDate)}</span>
            {saving && <span style={{ fontSize: 10, color: "var(--gold)", fontFamily: "var(--mono)" }}>saving…</span>}
          </div>
          <div className="card-bd">
            <div style={{ padding: "10px 14px", background: "var(--card2)", border: "1px solid var(--border)", borderRadius: "var(--rs)", marginBottom: 14, fontSize: 11, color: "var(--muted)", lineHeight: 2 }}>
              Write 3 things every night before sleep:
              {PROMPTS.map(p => <div key={p.k} style={{ color: p.color }}>• {p.label}</div>)}
            </div>

            {PROMPTS.map(p => (
              <div key={p.k} style={{ marginBottom: 14 }}>
                <div className="journal-prompt" style={{ color: p.color }}>
                  <span>{p.emoji}</span>{p.label}
                </div>
                <textarea
                  value={entry[p.k] || ""}
                  onChange={e => setEntry(prev => ({ ...prev, [p.k]: e.target.value }))}
                  placeholder={
                    p.k === "did"      ? "e.g. Completed all Chapter 2 exercises" :
                    p.k === "learned"  ? "e.g. Finally understood how pointers work" :
                                         "e.g. Grateful for uninterrupted study time"
                  }
                  style={{ minHeight: 68, borderLeft: `3px solid ${p.color}`, borderRadius: "0 var(--rs) var(--rs) 0" }}
                />
              </div>
            ))}

            {(entry.did || entry.learned || entry.grateful) && (
              <div style={{ fontSize: 11, color: "var(--green)", textAlign: "right" }}>✓ Saved automatically</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
