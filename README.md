# PPP3 Tracker

> A full-stack habit, study and progress tracker built to master *Programming: Principles and Practice Using C++* by Bjarne Stroustrup in **70 days**.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [API Reference](#api-reference)
- [Frontend Pages](#frontend-pages)
- [Data Flow](#data-flow)
- [70-Day Study Plan](#70-day-study-plan)
- [Scripts Reference](#scripts-reference)

---

## Overview

PPP3 Tracker is a personal productivity app with a dark developer aesthetic. It tracks everything needed to go from beginner to confident C++ programmer:

- **Daily habits** — 8 core habits with a 21-day visual heatmap
- **PPP3 chapters** — All 21 chapters with status, dates, notes, and exercise tracking
- **Tasks** — Full task manager with categories, priority, and status cycling
- **Schedule** — Fixed daily schedule + customizable one-off tasks per day
- **English & Aptitude** — Daily logs with full history tables
- **Journal** — Three-prompt nightly journal with auto-save
- **Dashboard** — Live stats: streak, day number, chapter progress, habit bars

All data is persisted to a local **SQLite** database via a REST API. The frontend uses **React + Vite** with no UI framework — just CSS variables and purposefully structured components.

---

## Tech Stack

| Layer      | Technology                    | Notes                                  |
|------------|-------------------------------|----------------------------------------|
| Frontend   | React 18 + Vite               | Component-per-page, custom hooks       |
| Backend    | Node.js + Express             | REST API, one route file per domain    |
| Database   | SQLite (`better-sqlite3`)     | Single file, WAL mode, zero config     |
| Styles     | Plain CSS + CSS variables     | No Tailwind, no CSS-in-JS              |
| Dev proxy  | Vite built-in                 | `/api/*` → `localhost:4000`            |

---

## Project Structure

```
ppp3-tracker/
│
├── backend/
│   ├── server.js                   # Express app entry — mounts all routes
│   ├── package.json
│   ├── .env.example                # Copy to .env before running
│   │
│   ├── db/
│   │   ├── schema.sql              # All 9 table definitions + indexes
│   │   └── database.js             # SQLite init, auto-seed chapters + tasks
│   │
│   ├── routes/
│   │   ├── habits.js               # GET /api/habits  POST /api/habits/:date
│   │   ├── chapters.js             # GET /api/chapters  PUT /api/chapters/:id
│   │   ├── tasks.js                # Full CRUD — GET POST PUT DELETE /api/tasks
│   │   ├── schedule.js             # Fixed schedule + custom day tasks
│   │   ├── ppp3log.js              # Daily PPP3 hours + notes
│   │   ├── englog.js               # Daily English study log
│   │   ├── aptlog.js               # Daily aptitude log + auto-score
│   │   └── journal.js              # Nightly 3-prompt journal
│   │
│   └── middleware/
│       └── errorHandler.js         # Centralised Express error handler
│
└── frontend/
    ├── index.html                  # Single HTML entry point
    ├── vite.config.js              # Vite + /api proxy config
    ├── package.json
    │
    └── src/
        ├── main.jsx                # React root render
        ├── App.jsx                 # Shell — routing state, layout composition
        ├── index.css               # Global tokens, resets, shared utility classes
        │
        ├── constants/
        │   ├── chapters.js         # All 21 PPP3 chapters with diff + topic data
        │   ├── habits.js           # 8 daily habits + aptitude topic lists
        │   └── schedule.js         # Default 9-item daily schedule
        │
        ├── api/
        │   └── client.js           # Typed fetch wrappers for every endpoint
        │
        ├── hooks/
        │   └── useTracker.js       # useHabits, useChapters, useTasks,
        │                           # useHabitGrid, useAutoSave, useStreak,
        │                           # useDayNumber, useDebounce
        │
        ├── components/
        │   ├── layout/
        │   │   ├── Sidebar.jsx + Sidebar.css     # Desktop left nav
        │   │   ├── Topbar.jsx + Topbar.css       # Page title + save indicator
        │   │   └── MobileNav.jsx + MobileNav.css # Fixed bottom nav (mobile)
        │   │
        │   └── ui/
        │       ├── StatCard.jsx + StatCard.css   # Metric card with progress bar
        │       ├── index.jsx                     # Card, ProgressBar, HabitChip,
        │       │                                 # FilterPill, Button, IconButton,
        │       │                                 # CheckRound, CheckSquare, EmptyState
        │       └── ui.css                        # All shared UI component styles
        │
        └── pages/
            ├── Dashboard.jsx       # Overview — stats, chapter, habit bars, tasks
            ├── Today.jsx           # Schedule + custom tasks + habits + PPP3 log
            ├── Habits.jsx          # 21-day heatmap + quick toggle
            ├── Chapters.jsx        # Chapter list + detail panel
            ├── Tasks.jsx           # Full task manager with filters
            ├── English.jsx         # English + Aptitude today/history tabs
            └── Journal.jsx         # Date-list + 3-prompt editor
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### 1 — Backend

```bash
cd backend
npm install
cp .env.example .env        # Edit START_DATE to your actual start date
node server.js
```

The server starts at `http://localhost:4000`. On first run it will:

1. Create `ppp3.db` (SQLite file)
2. Run `schema.sql` — creates all 9 tables
3. Seed all 21 chapters with status `todo`
4. Seed 19 initial tasks across all categories

### 2 — Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

App is available at `http://localhost:5173`. Vite proxies all `/api` requests to the Express backend — no CORS configuration needed during development.

---

## Environment Variables

Create `backend/.env` from `.env.example`:

```env
PORT=4000
DB_PATH=./ppp3.db
START_DATE=2024-01-01    # Your actual Day 1 — used to calculate current day number
```

---

## Database Schema

Nine tables, all in a single SQLite file.

| Table          | Purpose                                      | Key columns                          |
|----------------|----------------------------------------------|--------------------------------------|
| `meta`         | App config (single row)                      | `start_date`, `version`              |
| `habits`       | Daily habit completions                      | `date`, `habit`, `done`              |
| `chapters`     | PPP3 chapter user state                      | `id`, `status`, `start_date`, `notes`|
| `tasks`        | Master task list                             | `cat`, `text`, `priority`, `status`  |
| `schedule`     | Daily schedule item toggles                  | `date`, `item_id`, `done`            |
| `custom_tasks` | One-off tasks added for a specific day       | `date`, `text`, `done`               |
| `ppp3_log`     | Daily PPP3 study hours + notes               | `date`, `hours`, `pages`, `note`     |
| `eng_log`      | Daily English log                            | `date`, `bbc`, `anki`, `words`       |
| `apt_log`      | Daily aptitude log                           | `date`, `topic`, `questions`, `correct` |
| `journal`      | Nightly journal (3 prompts)                  | `date`, `did`, `learned`, `grateful` |

All date-keyed tables use `YYYY-MM-DD` text as the primary key or index for fast range queries.

---

## API Reference

All endpoints return JSON. Errors return `{ "error": "message" }` with an appropriate HTTP status.

### Health

```
GET  /api/health              → { ok, startDate, ts }
```

### Habits

```
GET  /api/habits?days=21      → { "2024-01-01": { ppp3: true, code: false, ... }, ... }
GET  /api/habits/:date        → { date, habits: { ppp3: bool, ... } }
POST /api/habits/:date        body: { habit, done }
```

### Chapters

```
GET  /api/chapters            → [ { id, status, startDate, endDate, exercisesDone, notes } ]
GET  /api/chapters/:id
PUT  /api/chapters/:id        body: { status?, startDate?, endDate?, exercisesDone?, notes? }
```

Status change rules enforced server-side: setting `active` auto-sets `startDate` if empty; setting `done` auto-sets both dates.

### Tasks

```
GET    /api/tasks?status=active&cat=PPP3    → [ ...tasks ]
GET    /api/tasks/:id
POST   /api/tasks             body: { cat, text, priority?, status?, targetDay? }
PUT    /api/tasks/:id         body: (any partial fields)
DELETE /api/tasks/:id
```

Tasks are returned sorted: `active` first, then `todo`, then `done`.

### Schedule

```
GET  /api/schedule/:date      → { date, scheduleItems: { s1: bool, ... }, customTasks: [...] }
PUT  /api/schedule/:date/item body: { itemId, done }
POST /api/schedule/:date/custom       body: { text }
PUT  /api/schedule/:date/custom/:id   body: { done } | { text }
DELETE /api/schedule/:date/custom/:id
```

### PPP3 Log

```
GET  /api/ppp3log             → [ { date, hours, pages, note } ]
GET  /api/ppp3log/:date
POST /api/ppp3log/:date       body: { hours?, pages?, note? }
```

### English Log

```
GET  /api/englog              → [ ...all entries ]
GET  /api/englog/:date
POST /api/englog/:date        body: { bbc?, anki?, words?, sentences?, wordList? }
```

### Aptitude Log

```
GET  /api/aptlog              → [ ...all entries with computed score field ]
GET  /api/aptlog/:date
POST /api/aptlog/:date        body: { topic?, questions?, correct?, notes? }
```

The `score` field (0–100) is computed server-side as `correct / questions * 100`.

### Journal

```
GET  /api/journal             → [ { date, did, learned, grateful } ]
GET  /api/journal/:date
POST /api/journal/:date       body: { did?, learned?, grateful? }
```

---

## Frontend Pages

| Page        | Route (state) | Description                                                |
|-------------|---------------|------------------------------------------------------------|
| Dashboard   | `dashboard`   | Live stats grid, active chapter, 7-day habit bars, quick habit toggle, active tasks |
| Today       | `today`       | Fixed schedule checklist, custom day tasks, habit toggle, PPP3 hours + note |
| Habits      | `habits`      | 21-day colour heatmap, streak, today quick toggle          |
| PPP3        | `chapters`    | Scrollable chapter list + detail panel with status, dates, notes |
| Tasks       | `tasks`       | Full task manager — add, edit (double-click), filter, delete, cycle status |
| English     | `english`     | Today tab (BBC/Anki toggles, word count, aptitude score) + History tab (tables) |
| Journal     | `journal`     | Date sidebar + 3-prompt nightly editor with auto-save      |

### Key Frontend Patterns

**Custom hooks** (`src/hooks/useTracker.js`) own all server communication. Pages never call `fetch` directly — they use hooks like `useHabits(date)`, `useTasks()`, `useChapters()`.

**Optimistic updates** — all mutations update local state immediately, then sync to the server. On error, state is rolled back.

**Auto-save** — the `useAutoSave(data, saveFn, delay)` hook debounces saves at 900ms. Used on every form that has free-text input (PPP3 log, English log, aptitude log, journal).

**API client** (`src/api/client.js`) — one typed function per endpoint. No axios, just `fetch` with a thin wrapper.

---

## Data Flow

```
User interaction
      │
      ▼
React page component
      │  calls hook
      ▼
useHabits / useTasks / useChapters / useAutoSave
      │  optimistic state update
      │  calls API client
      ▼
src/api/client.js  ──→  fetch("/api/...")
                                │
                                ▼  (Vite proxy in dev)
                        Express route handler
                                │
                                ▼
                        better-sqlite3 (sync)
                                │
                                ▼
                           ppp3.db (SQLite)
```

---

## 70-Day Study Plan

The tracker is built around this schedule:

| Days    | Part     | Chapters  | Focus                                 |
|---------|----------|-----------|---------------------------------------|
| 1–42    | Part I   | Ch 1–8    | Core C++ — types, functions, classes  |
| 43–59   | Part II  | Ch 9–14   | I/O, graphics, GUI                    |
| 60–70   | Part III | Ch 15–17  | Pointers, memory, essential operations|

**Critical chapters to never rush:**

- **Ch 4** — Errors and exceptions
- **Ch 5–6** — Calculator project (grammar → code)
- **Ch 15–16** — Pointers and free store (🔴 most difficult)

**Daily time targets:**

| Day type  | Target   | Schedule                                          |
|-----------|----------|---------------------------------------------------|
| Weekday   | 4.5 hrs  | 45 min morning read + 2 hr evening exercises      |
| Saturday  | 5 hrs    | Extended exercises + review                       |
| Sunday    | 10+ hrs  | Power day — reading + exercises + project + review|

---

## Scripts Reference

### Backend development

```bash
# Start with auto-reload
cd backend && npm run dev

# Start production
cd backend && npm start
```

### Frontend development

```bash
# Dev server (hot reload)
cd frontend && npm run dev

# Production build
cd frontend && npm run build

# Preview production build
cd frontend && npm run preview
```

### Database

The SQLite file is created automatically at the path set in `DB_PATH`. To reset all data:

```bash
rm backend/ppp3.db
node backend/server.js   # re-seeds automatically
```

To inspect the database directly:

```bash
sqlite3 backend/ppp3.db
sqlite> .tables
sqlite> SELECT * FROM chapters;
sqlite> SELECT date, COUNT(*) FROM habits GROUP BY date ORDER BY date DESC;
```

---

## Licence

Personal use. Built for one 70-day mission.
