import { useState } from "react";
import Sidebar    from "./components/layout/Sidebar.jsx";
import Topbar     from "./components/layout/Topbar.jsx";
import MobileNav  from "./components/layout/MobileNav.jsx";
import AIAssistant from "./components/ui/AIAssistant.jsx";
import Dashboard  from "./pages/Dashboard.jsx";
import Today      from "./pages/Today.jsx";
import Habits     from "./pages/Habits.jsx";
import Chapters   from "./pages/Chapters.jsx";
import Tasks      from "./pages/Tasks.jsx";
import English    from "./pages/English.jsx";
import Journal    from "./pages/Journal.jsx";
import { useStreak, useDayNumber, useTasks, useChapters } from "./hooks/useTracker.js";
import { CHAPTERS } from "./constants/chapters.js";
import "./components/ui/ui.css";

export default function App() {
  const [page,   setPage]   = useState("dashboard");
  const [saving, setSaving] = useState(false);

  const streak             = useStreak(30);
  const { dayNum }         = useDayNumber();
  const { tasks }          = useTasks();
  const { chapters }       = useChapters();
  const tasksDone          = tasks.filter(t => t.status === "done").length;

  // Build context for the AI assistant
  const activeChapter    = chapters?.find(c => c.status === "active");
  const activeChapterDef = activeChapter ? CHAPTERS.find(c => c.id === activeChapter.id) : null;
  const trackerContext   = {
    dayNum,
    streak,
    chaptersDone: chapters?.filter(c => c.status === "done").length || 0,
    activeChapter: activeChapterDef?.title || null,
  };

  // Reset saving indicator when switching pages
  const navigate = (p) => { setSaving(false); setPage(p); };
  const pageProps = { setPage: navigate, setSaving };

  return (
    <div className="shell">
      {/* Desktop sidebar */}
      <Sidebar
        page={page}
        setPage={navigate}
        dayNum={dayNum}
        streak={streak}
        saving={saving}
        tasksDone={tasksDone}
      />

      {/* Main area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <Topbar page={page} saving={saving} />
        <div className="page-scroll">
          {page === "dashboard" && <Dashboard {...pageProps} streak={streak} dayNum={dayNum} />}
          {page === "today"     && <Today     {...pageProps} />}
          {page === "habits"    && <Habits    {...pageProps} streak={streak} />}
          {page === "chapters"  && <Chapters  {...pageProps} />}
          {page === "tasks"     && <Tasks     {...pageProps} />}
          {page === "english"   && <English   {...pageProps} />}
          {page === "journal"   && <Journal   {...pageProps} />}
        </div>
      </div>

      {/* Mobile bottom nav */}
      <MobileNav page={page} setPage={navigate} />

      {/* AI Study Assistant */}
      <AIAssistant trackerContext={trackerContext} />
    </div>
  );
}
