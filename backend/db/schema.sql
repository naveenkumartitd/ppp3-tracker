-- ─────────────────────────────────────────────────────────────────────────────
-- PPP3 Tracker Database Schema
-- SQLite — single file, zero config
-- ─────────────────────────────────────────────────────────────────────────────

-- App-level metadata (single row)
CREATE TABLE IF NOT EXISTS meta (
  id         INTEGER PRIMARY KEY CHECK (id = 1),
  start_date TEXT    NOT NULL,
  version    INTEGER NOT NULL DEFAULT 1
);

-- Daily habit completions
-- One row per habit per date
CREATE TABLE IF NOT EXISTS habits (
  date    TEXT NOT NULL,
  habit   TEXT NOT NULL,   -- ppp3 | code | exercise | english | aptitude | sleep | nophone | journal
  done    INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, habit)
);

-- PPP3 chapter user state (overlaid on the fixed 21-chapter list from constants)
CREATE TABLE IF NOT EXISTS chapters (
  id             INTEGER PRIMARY KEY,  -- 1–21
  status         TEXT NOT NULL DEFAULT 'todo',  -- todo | active | done
  start_date     TEXT,
  end_date       TEXT,
  exercises_done INTEGER NOT NULL DEFAULT 0,
  notes          TEXT    NOT NULL DEFAULT ''
);

-- Master task list
CREATE TABLE IF NOT EXISTS tasks (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  cat        TEXT    NOT NULL,    -- PPP3 | Habits | English | Aptitude | Community | Java
  text       TEXT    NOT NULL,
  priority   TEXT    NOT NULL DEFAULT 'medium',  -- high | medium | low
  status     TEXT    NOT NULL DEFAULT 'todo',    -- todo | active | done
  target_day INTEGER,
  created_at TEXT    NOT NULL DEFAULT (date('now'))
);

-- Daily schedule item completions
CREATE TABLE IF NOT EXISTS schedule (
  date      TEXT NOT NULL,
  item_id   TEXT NOT NULL,   -- s1..s9 matching the default schedule constant
  done      INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (date, item_id)
);

-- Custom one-off tasks for a specific day
CREATE TABLE IF NOT EXISTS custom_tasks (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  date    TEXT    NOT NULL,
  text    TEXT    NOT NULL,
  done    INTEGER NOT NULL DEFAULT 0
);

-- Daily PPP3 study log
CREATE TABLE IF NOT EXISTS ppp3_log (
  date  TEXT    PRIMARY KEY,
  hours REAL    NOT NULL DEFAULT 0,
  pages INTEGER NOT NULL DEFAULT 0,
  note  TEXT    NOT NULL DEFAULT ''
);

-- Daily English study log
CREATE TABLE IF NOT EXISTS eng_log (
  date      TEXT    PRIMARY KEY,
  bbc       INTEGER NOT NULL DEFAULT 0,
  anki      INTEGER NOT NULL DEFAULT 0,
  words     INTEGER NOT NULL DEFAULT 0,
  sentences INTEGER NOT NULL DEFAULT 0,
  word_list TEXT    NOT NULL DEFAULT ''
);

-- Daily Aptitude log
CREATE TABLE IF NOT EXISTS apt_log (
  date      TEXT    PRIMARY KEY,
  topic     TEXT    NOT NULL DEFAULT '',
  questions INTEGER NOT NULL DEFAULT 0,
  correct   INTEGER NOT NULL DEFAULT 0,
  notes     TEXT    NOT NULL DEFAULT ''
);

-- Daily journal entries (3-field format)
CREATE TABLE IF NOT EXISTS journal (
  date     TEXT PRIMARY KEY,
  did      TEXT NOT NULL DEFAULT '',
  learned  TEXT NOT NULL DEFAULT '',
  grateful TEXT NOT NULL DEFAULT ''
);

-- Indexes for fast date-range queries
CREATE INDEX IF NOT EXISTS idx_habits_date      ON habits      (date);
CREATE INDEX IF NOT EXISTS idx_schedule_date    ON schedule    (date);
CREATE INDEX IF NOT EXISTS idx_custom_tasks_date ON custom_tasks (date);
CREATE INDEX IF NOT EXISTS idx_tasks_status     ON tasks       (status);
CREATE INDEX IF NOT EXISTS idx_tasks_cat        ON tasks       (cat);
