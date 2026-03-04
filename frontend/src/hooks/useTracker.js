import { useState, useEffect, useCallback, useRef } from "react";
import { habitsApi, chaptersApi, tasksApi, ppp3Api } from "../api/client";
import { HABITS } from "../constants/habits";

const TODAY = new Date().toISOString().split("T")[0];

export function useToday() {
  return TODAY;
}

export function useDebounce(fn, delay = 800) {
  const timer = useRef(null);
  return useCallback((...args) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}

// ── useHabits ─────────────────────────────────────────────────────────
// Loads and manages a single date's habits with optimistic updates.
export function useHabits(date) {
  const [habits, setHabits] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    habitsApi.getDate(date)
      .then(r => setHabits(r.habits))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [date]);

  const toggle = async (habitId) => {
    const newVal = !habits[habitId];
    setHabits(prev => ({ ...prev, [habitId]: newVal })); // optimistic
    try {
      await habitsApi.toggle(date, habitId, newVal);
    } catch {
      setHabits(prev => ({ ...prev, [habitId]: !newVal })); // rollback
    }
  };

  const count = HABITS.filter(h => habits[h.id]).length;

  return { habits, loading, toggle, count };
}

// ── useHabitGrid ──────────────────────────────────────────────────────
// Loads last N days of habits for the 21-day heatmap.
export function useHabitGrid(days = 21) {
  const [grid, setGrid]     = useState({});
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    habitsApi.getRange(days)
      .then(setGrid)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [days]);

  useEffect(() => { reload(); }, [reload]);

  const toggle = async (date, habitId) => {
    const cur = (grid[date] || {})[habitId];
    setGrid(prev => ({ ...prev, [date]: { ...(prev[date] || {}), [habitId]: !cur } }));
    try {
      await habitsApi.toggle(date, habitId, !cur);
    } catch {
      setGrid(prev => ({ ...prev, [date]: { ...(prev[date] || {}), [habitId]: cur } }));
    }
  };

  return { grid, loading, toggle, reload };
}

// ── useChapters ───────────────────────────────────────────────────────
export function useChapters() {
  const [chapters, setChapters] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  const reload = useCallback(() => {
    setLoading(true);
    chaptersApi.getAll()
      .then(setChapters)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const update = async (id, body) => {
    // Optimistic update
    setChapters(prev => prev.map(c => c.id === id ? { ...c, ...body } : c));
    try {
      const updated = await chaptersApi.update(id, body);
      setChapters(prev => prev.map(c => c.id === id ? updated : c));
    } catch (e) {
      setError(e.message);
      reload(); // revert
    }
  };

  return { chapters, loading, error, update, reload };
}

// ── useTasks ──────────────────────────────────────────────────────────
export function useTasks() {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const reload = useCallback(() => {
    setLoading(true);
    tasksApi.getAll()
      .then(setTasks)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const add = async (body) => {
    try {
      const t = await tasksApi.create(body);
      setTasks(prev => [t, ...prev]);
    } catch (e) { setError(e.message); }
  };

  const update = async (id, body) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...body } : t));
    try {
      const updated = await tasksApi.update(id, body);
      setTasks(prev => prev.map(t => t.id === id ? updated : t));
    } catch (e) { setError(e.message); reload(); }
  };

  const remove = async (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    try { await tasksApi.remove(id); }
    catch (e) { setError(e.message); reload(); }
  };

  const cycleStatus = (id) => {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    const next = { todo: "active", active: "done", done: "todo" }[t.status];
    update(id, { status: next });
  };

  return { tasks, loading, error, add, update, remove, cycleStatus, reload };
}

// ── useAutoSave ───────────────────────────────────────────────────────
// Generic hook for auto-saving a form after changes stop.
export function useAutoSave(data, saveFn, delay = 900) {
  const [saving, setSaving] = useState(false);
  const timer = useRef(null);
  const isFirst = useRef(true);
  const saveFnRef = useRef(saveFn);
  saveFnRef.current = saveFn;

  useEffect(() => {
    if (isFirst.current) { isFirst.current = false; return; }
    setSaving(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try { await saveFnRef.current(data); }
      catch (e) { console.error("Auto-save failed:", e.message); }
      setSaving(false);
    }, delay);

    return () => clearTimeout(timer.current);
  }, [JSON.stringify(data), delay]); // eslint-disable-line

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeout(timer.current);
    };
  }, []);

  return { saving };
}

// ── useStreak ─────────────────────────────────────────────────────────
export function useStreak(days = 30) {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    habitsApi.getRange(days).then(grid => {
      let s = 0;
      const d = new Date();
      while (true) {
        const k = d.toISOString().split("T")[0];
        const count = HABITS.filter(h => (grid[k] || {})[h.id]).length;
        if (count < 5) break;
        s++;
        d.setDate(d.getDate() - 1);
      }
      setStreak(s);
    }).catch(console.error);
  }, [days]);

  return streak;
}

// ── useDayNumber ──────────────────────────────────────────────────────
export function useDayNumber() {
  const [dayNum, setDayNum] = useState(1);
  const [startDate, setStartDate] = useState(TODAY);

  useEffect(() => {
    fetch("/api/health").then(r => r.json()).then(data => {
      if (data.startDate) {
        setStartDate(data.startDate);
        const diff = Math.floor((new Date(TODAY) - new Date(data.startDate)) / 86400000);
        setDayNum(Math.max(1, diff + 1));
      }
    }).catch(console.error);
  }, []);

  return { dayNum, startDate };
}
