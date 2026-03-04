import { useState, useEffect } from "react";
import { engApi, aptApi } from "../api/client.js";
import { useAutoSave } from "../hooks/useTracker.js";
import { HabitChip, FilterPill } from "../components/ui/index.jsx";
import { APT_TOPICS } from "../constants/habits.js";

const TODAY = new Date().toISOString().split("T")[0];
const fmtS  = (s) => new Date(s + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short" });

export default function English({ setSaving }) {
  const [view, setView]         = useState("today");
  const [histType, setHistType] = useState("english");

  // Today state
  const [eng, setEng] = useState({ bbc: false, anki: false, words: "", sentences: "", wordList: "" });
  const [apt, setApt] = useState({ topic: "", questions: "", correct: "", notes: "" });

  // History
  const [engHist, setEngHist] = useState([]);
  const [aptHist, setAptHist] = useState([]);

  useEffect(() => {
    engApi.getDate(TODAY).then(d => setEng({ bbc: d.bbc, anki: d.anki, words: d.words || "", sentences: d.sentences || "", wordList: d.wordList || "" }));
    aptApi.getDate(TODAY).then(d => setApt({ topic: d.topic || "", questions: d.questions || "", correct: d.correct || "", notes: d.notes || "" }));
    engApi.getAll().then(setEngHist);
    aptApi.getAll().then(setAptHist);
  }, []);

  const { saving: engSaving } = useAutoSave(eng, (d) => engApi.save(TODAY, d));
  const { saving: aptSaving } = useAutoSave(apt, (d) => aptApi.save(TODAY, d));
  useEffect(() => { setSaving(engSaving || aptSaving); }, [engSaving, aptSaving, setSaving]);

  const totalWords = engHist.reduce((a, b) => a + (b.words || 0), 0);
  const totalQ     = aptHist.reduce((a, b) => a + (b.questions || 0), 0);
  const scores     = aptHist.filter(x => x.questions && x.correct).map(x => Math.round(x.correct / x.questions * 100));
  const avgScore   = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  const todayScore = apt.questions && apt.correct
    ? Math.round(parseInt(apt.correct) / parseInt(apt.questions) * 100) : null;

  return (
    <div className="fade-up">
      {/* Summary row */}
      <div className="g3 mb16">
        {[
          { ico: "📝", lbl: "Total Words",    val: totalWords, c: "var(--gold)"   },
          { ico: "🧮", lbl: "Total Questions", val: totalQ,    c: "var(--blue2)"  },
          { ico: "🎯", lbl: "Average Score",   val: avgScore + "%", c: avgScore >= 70 ? "var(--green)" : "var(--orange)" },
        ].map(s => (
          <div key={s.lbl} className="card-base" style={{ padding: 18, textAlign: "center", transition: "all 0.25s" }}>
            <div style={{ fontSize: 24, marginBottom: 6, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }}>{s.ico}</div>
            <div style={{ fontFamily: "var(--mono)", fontSize: 26, fontWeight: 700, color: s.c, letterSpacing: "-0.02em" }}>{s.val}</div>
            <div style={{ fontSize: 9, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 5, fontWeight: 600 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="fpill mb16">
        <FilterPill label="⚡ Today"    active={view === "today"}   onClick={() => setView("today")} />
        <FilterPill label="📅 History" active={view === "history"} onClick={() => setView("history")} />
      </div>

      {/* ── TODAY ── */}
      {view === "today" && (
        <div className="g2">
          {/* English */}
          <div className="card-base">
            <div className="card-hd"><span className="section-title">🇬🇧 English — Today</span></div>
            <div className="card-bd">
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <HabitChip icon="📰" label="BBC Article" done={eng.bbc}
                  onClick={() => setEng(p => ({ ...p, bbc: !p.bbc }))} />
                <HabitChip icon="🗂" label="Anki Review" done={eng.anki}
                  onClick={() => setEng(p => ({ ...p, anki: !p.anki }))} />
              </div>
              <div className="g2 mb12">
                {[{ k: "words", l: "New Words" }, { k: "sentences", l: "Sentences Written" }].map(f => (
                  <div key={f.k}>
                    <div className="lbl">{f.l}</div>
                    <input type="number" min="0" value={eng[f.k]} placeholder="0"
                      onChange={e => setEng(p => ({ ...p, [f.k]: e.target.value }))}
                      style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: "var(--gold)", textAlign: "center" }} />
                  </div>
                ))}
              </div>
              <div className="lbl">Words Learned (write them all out)</div>
              <textarea placeholder={"e.g.\nproliferate — to grow rapidly\nubiquitous — present everywhere"}
                value={eng.wordList}
                onChange={e => setEng(p => ({ ...p, wordList: e.target.value }))}
                style={{ minHeight: 90 }} />
            </div>
          </div>

          {/* Aptitude */}
          <div className="card-base">
            <div className="card-hd"><span className="section-title">🧮 Aptitude — Today</span></div>
            <div className="card-bd">
              <div className="mb12">
                <div className="lbl">Topic Studied</div>
                <input placeholder="e.g. Percentages" value={apt.topic}
                  onChange={e => setApt(p => ({ ...p, topic: e.target.value }))} />
              </div>
              <div className="g2 mb12">
                <div>
                  <div className="lbl">Questions Done</div>
                  <input type="number" min="0" value={apt.questions} placeholder="10"
                    onChange={e => setApt(p => ({ ...p, questions: e.target.value }))}
                    style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: "var(--blue2)", textAlign: "center" }} />
                </div>
                <div>
                  <div className="lbl">Correct Answers</div>
                  <input type="number" min="0" value={apt.correct} placeholder="8"
                    onChange={e => setApt(p => ({ ...p, correct: e.target.value }))}
                    style={{ fontFamily: "var(--mono)", fontSize: 20, fontWeight: 700, color: "var(--green)", textAlign: "center" }} />
                </div>
              </div>

              {todayScore !== null && (
                <div style={{ padding: "10px 14px", background: todayScore >= 70 ? "var(--green-gl)" : "var(--red-gl)", border: `1px solid ${todayScore >= 70 ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: "var(--rs)", textAlign: "center", marginBottom: 12 }}>
                  <div style={{ fontFamily: "var(--mono)", fontSize: 28, fontWeight: 700, color: todayScore >= 70 ? "var(--green)" : "var(--orange)" }}>{todayScore}%</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{todayScore >= 70 ? "Good work!" : "Keep practising!"}</div>
                </div>
              )}

              <div className="lbl">Notes</div>
              <textarea placeholder="What formula did you learn? What was hard?" value={apt.notes}
                onChange={e => setApt(p => ({ ...p, notes: e.target.value }))}
                style={{ minHeight: 55, marginBottom: 12 }} />

              <div className="divider" />
              <div className="section-title" style={{ marginBottom: 8 }}>Quick Topic Select</div>
              {Object.entries(APT_TOPICS).map(([pri, topics]) => (
                <div key={pri} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 8, color: "var(--gold)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{pri}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                    {topics.map(t => (
                      <span key={t} className={`topic-pill ${apt.topic === t ? "selected" : ""}`}
                        onClick={() => setApt(p => ({ ...p, topic: t }))}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── HISTORY ── */}
      {view === "history" && (
        <div>
          <div className="fpill mb12">
            <FilterPill label="🇬🇧 English History"  active={histType === "english"}  onClick={() => setHistType("english")} />
            <FilterPill label="🧮 Aptitude History" active={histType === "aptitude"} onClick={() => setHistType("aptitude")} />
          </div>

          {histType === "english" && (
            <div className="card-base">
              <div className="card-hd">
                <span className="section-title">🇬🇧 English Log — All Days</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{engHist.length} days · {totalWords} words total</span>
              </div>
              {engHist.length === 0 ? (
                <div className="empty-state"><div>No history yet — start logging today!</div></div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table">
                    <thead><tr><th>Date</th><th>BBC</th><th>Anki</th><th>Words</th><th>Sentences</th><th>Word List</th></tr></thead>
                    <tbody>
                      {engHist.map(row => (
                        <tr key={row.date}>
                          <td style={{ fontFamily: "var(--mono)", fontSize: 11, color: row.date === TODAY ? "var(--gold)" : "var(--muted)", fontWeight: row.date === TODAY ? 700 : 400, whiteSpace: "nowrap" }}>
                            {row.date === TODAY ? "Today" : fmtS(row.date)}
                          </td>
                          <td style={{ color: row.bbc  ? "var(--green)" : "var(--muted)" }}>{row.bbc  ? "✅" : "—"}</td>
                          <td style={{ color: row.anki ? "var(--green)" : "var(--muted)" }}>{row.anki ? "✅" : "—"}</td>
                          <td><span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: "var(--gold)"  }}>{row.words     || 0}</span></td>
                          <td><span style={{ fontFamily: "var(--mono)", fontWeight: 700, color: "var(--blue2)" }}>{row.sentences || 0}</span></td>
                          <td style={{ fontSize: 11, color: "var(--muted)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.wordList || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {histType === "aptitude" && (
            <div className="card-base">
              <div className="card-hd">
                <span className="section-title">🧮 Aptitude Log — All Days</span>
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{aptHist.length} days · avg {avgScore}%</span>
              </div>
              {aptHist.length === 0 ? (
                <div className="empty-state"><div>No history yet — start logging today!</div></div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="data-table">
                    <thead><tr><th>Date</th><th>Topic</th><th>Done</th><th>Correct</th><th>Score</th><th>Notes</th></tr></thead>
                    <tbody>
                      {aptHist.map(row => {
                        const sc  = row.score;
                        const sc_c = sc >= 80 ? "var(--green)" : sc >= 60 ? "var(--gold)" : "var(--red)";
                        return (
                          <tr key={row.date}>
                            <td style={{ fontFamily: "var(--mono)", fontSize: 11, color: row.date === TODAY ? "var(--gold)" : "var(--muted)", fontWeight: row.date === TODAY ? 700 : 400, whiteSpace: "nowrap" }}>
                              {row.date === TODAY ? "Today" : fmtS(row.date)}
                            </td>
                            <td style={{ fontWeight: 600 }}>{row.topic || "—"}</td>
                            <td style={{ fontFamily: "var(--mono)", color: "var(--blue2)" }}>{row.questions}</td>
                            <td style={{ fontFamily: "var(--mono)", color: "var(--green)"  }}>{row.correct}</td>
                            <td>{sc !== null ? <span className="score-badge" style={{ background: sc_c + "20", color: sc_c }}>{sc}%</span> : "—"}</td>
                            <td style={{ fontSize: 11, color: "var(--muted)", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.notes || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
