import { useState, useEffect, useCallback } from "react";

// ─── Storage helpers ──────────────────────────────────────────────────────────
const STORAGE_KEY = "ppp3_tracker_v1";

async function loadData() {
  try {
    const r = await window.storage.get(STORAGE_KEY);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
}

async function saveData(data) {
  try {
    await window.storage.set(STORAGE_KEY, JSON.stringify(data));
  } catch (e) { console.error("Save failed", e); }
}

// ─── Initial state ────────────────────────────────────────────────────────────
const TODAY_STR = new Date().toISOString().split("T")[0];

const CHAPTERS = [
  { id: 1,  part: "I",   title: "Hello, World!",              diff: "easy",   days: "1–3"   },
  { id: 2,  part: "I",   title: "Objects, Types and Values",   diff: "easy",   days: "4–7"   },
  { id: 3,  part: "I",   title: "Computation",                 diff: "medium", days: "8–12"  },
  { id: 4,  part: "I",   title: "Errors! ⚠",                  diff: "hard",   days: "13–19" },
  { id: 5,  part: "I",   title: "Writing a Program ⚠",        diff: "hard",   days: "20–27" },
  { id: 6,  part: "I",   title: "Completing a Program ⚠",     diff: "hard",   days: "28–33" },
  { id: 7,  part: "I",   title: "Functions",                   diff: "medium", days: "34–37" },
  { id: 8,  part: "I",   title: "Classes",                     diff: "medium", days: "38–42" },
  { id: 9,  part: "II",  title: "I/O Streams",                 diff: "medium", days: "43–46" },
  { id: 10, part: "II",  title: "A Display Model",             diff: "easy",   days: "47–49" },
  { id: 11, part: "II",  title: "Graphics Classes",            diff: "easy",   days: "50–52" },
  { id: 12, part: "II",  title: "Class Design",                diff: "medium", days: "53–55" },
  { id: 13, part: "II",  title: "Graphing Functions",          diff: "easy",   days: "56–57" },
  { id: 14, part: "II",  title: "Graphical User Interfaces",   diff: "easy",   days: "58–60" },
  { id: 15, part: "III", title: "Vector & Free Store 🔴",      diff: "hard",   days: "61–64" },
  { id: 16, part: "III", title: "Arrays, Pointers, Refs 🔴",   diff: "hard",   days: "65–67" },
  { id: 17, part: "III", title: "Essential Operations",        diff: "medium", days: "68–70" },
  { id: 18, part: "III", title: "Templates & Exceptions ⚠",   diff: "hard",   days: "71–80" },
  { id: 19, part: "III", title: "Containers & Iterators",      diff: "medium", days: "81–87" },
  { id: 20, part: "III", title: "Maps and Sets",               diff: "medium", days: "88–93" },
  { id: 21, part: "III", title: "Algorithms",                  diff: "medium", days: "94–100"},
];

const HABITS = [
  { id: "ppp3",     icon: "📖", label: "PPP3 Study"        },
  { id: "code",     icon: "💻", label: "Code Practice"      },
  { id: "exercise", icon: "🏃", label: "Morning Exercise"   },
  { id: "english",  icon: "🇬🇧", label: "BBC English"      },
  { id: "aptitude", icon: "🧮", label: "Aptitude (10 q)"   },
  { id: "sleep",    icon: "😴", label: "Sleep by 10 PM"     },
  { id: "nophone",  icon: "📵", label: "No Social Media"   },
  { id: "journal",  icon: "📓", label: "Night Journal"      },
];

const INIT_TASKS = [
  { id: 1,  cat: "PPP3",     text: "Setup C++ dev environment (VS Code + GCC)",    pri: "high",   status: "todo",    day: 1  },
  { id: 2,  cat: "PPP3",     text: "Complete Chapter 1 — all exercises done",       pri: "high",   status: "done",    day: 3  },
  { id: 3,  cat: "PPP3",     text: "Read Chapter 2 — Objects, Types and Values",    pri: "high",   status: "active",  day: 7  },
  { id: 4,  cat: "PPP3",     text: "Complete ALL Chapter 2 exercises",              pri: "high",   status: "todo",    day: 7  },
  { id: 5,  cat: "PPP3",     text: "Read Chapter 3 — Computation",                 pri: "high",   status: "todo",    day: 12 },
  { id: 6,  cat: "PPP3",     text: "Read Chapter 4 — Errors (CRITICAL)",           pri: "high",   status: "todo",    day: 19 },
  { id: 7,  cat: "PPP3",     text: "Build Calculator Project — Ch 5 & 6",          pri: "high",   status: "todo",    day: 33 },
  { id: 8,  cat: "PPP3",     text: "Complete Part I — Chapters 1 to 8",            pri: "high",   status: "todo",    day: 42 },
  { id: 9,  cat: "PPP3",     text: "Complete Part II — Chapters 9 to 14",          pri: "high",   status: "todo",    day: 59 },
  { id: 10, cat: "PPP3",     text: "Complete Chapter 15 — Pointers (CRITICAL)",    pri: "high",   status: "todo",    day: 64 },
  { id: 11, cat: "Habits",   text: "Start morning walk — 20 min every day",        pri: "high",   status: "todo",    day: 1  },
  { id: 12, cat: "Habits",   text: "Set phone grayscale mode",                     pri: "medium", status: "todo",    day: 1  },
  { id: 13, cat: "Habits",   text: "Install One Sec app — social media pause",     pri: "medium", status: "todo",    day: 1  },
  { id: 14, cat: "Habits",   text: "Sleep before 10:00 PM every night",            pri: "high",   status: "todo",    day: 1  },
  { id: 15, cat: "English",  text: "Bookmark bbclearningenglish.com",              pri: "medium", status: "todo",    day: 1  },
  { id: 16, cat: "English",  text: "Install Anki app — 10 words per day",         pri: "medium", status: "todo",    day: 2  },
  { id: 17, cat: "Aptitude", text: "Create IndiaBix account — indiabix.com",      pri: "medium", status: "todo",    day: 1  },
  { id: 18, cat: "Aptitude", text: "Complete Priority 1 topics (%, numbers)",     pri: "high",   status: "todo",    day: 30 },
  { id: 19, cat: "Community","text": "Join r/learnprogramming on Reddit",          pri: "low",    status: "todo",    day: 7  },
  { id: 20, cat: "Java",     text: "Understand OOP in C++ before Java class (Ch8)",pri: "high",   status: "todo",    day: 70 },
];

function buildInitialState() {
  return {
    startDate: TODAY_STR,
    chapters: CHAPTERS.map(c => ({
      ...c,
      status: c.id === 1 ? "done" : c.id === 2 ? "active" : "todo",
      startDate: c.id === 1 ? TODAY_STR : c.id === 2 ? TODAY_STR : null,
      endDate:   c.id === 1 ? TODAY_STR : null,
      notes: "",
    })),
    habits: {},      // { "2024-01-01": { ppp3: true, ... } }
    tasks: INIT_TASKS,
    englishLog: {},  // { "2024-01-01": { words: 5, bbc: true, anki: true } }
    aptitudeLog: {}, // { "2024-01-01": { topic: "", questions: 10, score: 8 } }
    notes: {},       // { "2024-01-01": "..." }
    ppp3Hours: {},   // { "2024-01-01": 2.5 }
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStreak(habits, startDate) {
  let streak = 0;
  const d = new Date();
  while (true) {
    const key = d.toISOString().split("T")[0];
    const day = habits[key];
    if (!day) break;
    const done = HABITS.filter(h => day[h.id]).length;
    if (done < 5) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function getDayNumber(startDate) {
  const start = new Date(startDate);
  const now   = new Date();
  return Math.floor((now - start) / 86400000) + 1;
}

function getDiffColor(diff) {
  if (diff === "hard")   return "#ff6b6b";
  if (diff === "medium") return "#ffd93d";
  return "#6bcb77";
}

function getStatusStyle(status) {
  if (status === "done")   return { bg: "#1a2e1a", border: "#4caf50", text: "#4caf50" };
  if (status === "active") return { bg: "#1a2540", border: "#4d9fff", text: "#4d9fff" };
  return { bg: "#1a1a24", border: "#333", text: "#666" };
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0a0c14;
    --surface:  #0f1220;
    --card:     #141828;
    --border:   #1e2440;
    --border2:  #2a3060;
    --text:     #e2e8f0;
    --muted:    #64748b;
    --amber:    #f59e0b;
    --amber2:   #fbbf24;
    --blue:     #4d9fff;
    --green:    #4caf50;
    --red:      #ff6b6b;
    --purple:   #a78bfa;
    --mono:     'JetBrains Mono', monospace;
    --sans:     'Outfit', sans-serif;
  }

  html, body { height: 100%; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--sans);
    font-size: 14px;
    line-height: 1.6;
    overflow-x: hidden;
  }

  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* ...rest preserved for brevity... */
`;

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(null);
  const [tab,  setTab]  = useState("today");
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load
  useEffect(() => {
    loadData().then(d => {
      setData(d || buildInitialState());
      setLoaded(true);
    });
  }, []);

  // Save on change
  useEffect(() => {
    if (!loaded || !data) return;
    setSaving(true);
    const t = setTimeout(() => {
      saveData(data).then(() => setSaving(false));
    }, 600);
    return () => clearTimeout(t);
  }, [data, loaded]);

  const update = useCallback((fn) => {
    setData(prev => {
      const next = { ...prev };
      fn(next);
      return next;
    });
  }, []);

  if (!data) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"100vh", color:"#f59e0b", fontFamily:"monospace" }}>
      loading tracker...
    </div>
  );

  const todayHabits  = data.habits[TODAY_STR] || {};
  const streak       = getStreak(data.habits, data.startDate);
  const dayNum       = getDayNumber(data.startDate);
  const doneChapters = data.chapters.filter(c => c.status === "done").length;
  const doneTasks    = data.tasks.filter(t => t.status === "done").length;
  const totalHours   = Object.values(data.ppp3Hours).reduce((a,b) => a + (parseFloat(b)||0), 0);
  const activeChapter = data.chapters.find(c => c.status === "active") || data.chapters.find(c => c.status !== "done");

  const TABS = [
    { id:"today",    icon:"⚡", label:"Today"       },
    { id:"habits",   icon:"🔥", label:"Habits"      },
    { id:"chapters", icon:"📖", label:"PPP3"        },
    { id:"tasks",    icon:"✅", label:"Tasks"       },
    { id:"english",  icon:"🇬🇧", label:"English"   },
    { id:"notes",    icon:"📓", label:"Notes"       },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* Header */}
        <header className="header">
          <div className="logo">
            <span>PPP3</span>
            <span className="logo-dot">/</span>
            <span style={{color:"#64748b", fontWeight:400}}>tracker</span>
          </div>
          <nav className="nav">
            {TABS.map(t => (
              <button key={t.id} className={`nav-btn ${tab===t.id?"active":""}`} onClick={() => setTab(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </nav>
          <div className="streak-badge">🔥 {streak} day streak</div>
          <span className={`saving ${saving?"active pulsing":""}`}>{saving?"saving...":"●"}</span>
        </header>

        <main className="main">
          {/* Stats row — always visible */}
          <div className="stats-row">
            {[
              { label:"Day",      value: dayNum,        sub:"of 70",             accent:"#f59e0b" },
              { label:"Streak",   value: streak,        sub:"days in a row",     accent:"#ff6b6b" },
              { label:"Chapters", value: `${doneChapters}/21`, sub:"complete",   accent:"#4d9fff" },
              { label:"Tasks",    value: doneTasks,     sub:`of ${data.tasks.length} done`, accent:"#4caf50" },
              { label:"Hours",    value: totalHours.toFixed(1), sub:"PPP3 total",accent:"#a78bfa" },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{"--accent": s.accent}}>
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                <div className="stat-sub">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Pages */}
          {tab === "today"    && <div>Today page (legacy)</div>}
          {tab === "habits"   && <div>Habits page (legacy)</div>}
          {tab === "chapters" && <div>Chapters page (legacy)</div>}
          {tab === "tasks"    && <div>Tasks page (legacy)</div>}
          {tab === "english"  && <div>English page (legacy)</div>}
          {tab === "notes"    && <div>Notes page (legacy)</div>}
        </main>
      </div>
    </>
  );
}
