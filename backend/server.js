require("dotenv").config();
const express      = require("express");
const cors         = require("cors");
const { getDb }    = require("./db/database");
const errorHandler = require("./middleware/errorHandler");

// Import routes
const habitsRouter   = require("./routes/habits");
const chaptersRouter = require("./routes/chapters");
const tasksRouter    = require("./routes/tasks");
const scheduleRouter = require("./routes/schedule");
const ppp3logRouter  = require("./routes/ppp3log");
const englogRouter   = require("./routes/englog");
const aptlogRouter   = require("./routes/aptlog");
const journalRouter  = require("./routes/journal");

const app  = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ──────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, cb) => {
    // Allow requests from any localhost port (dev) or same-origin (prod)
    if (!origin || /^https?:\/\/localhost(:\d+)?$/.test(origin)) cb(null, true);
    else cb(null, false);
  },
  credentials: true,
}));
app.use(express.json());

// ── Health check ────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  const db = getDb();
  const meta = db.prepare("SELECT * FROM meta WHERE id = 1").get();
  res.json({ ok: true, startDate: meta?.start_date, ts: new Date().toISOString() });
});

// ── Routes ──────────────────────────────────────────────────────────
app.use("/api/habits",   habitsRouter);
app.use("/api/chapters", chaptersRouter);
app.use("/api/tasks",    tasksRouter);
app.use("/api/schedule", scheduleRouter);
app.use("/api/ppp3log",  ppp3logRouter);
app.use("/api/englog",   englogRouter);
app.use("/api/aptlog",   aptlogRouter);
app.use("/api/journal",  journalRouter);

// ── Serve frontend build in production ──────────────────────────────
const path = require("path");
const frontendDist = path.join(__dirname, "..", "frontend", "dist");
const fs = require("fs");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // SPA fallback — serve index.html for any non-API route
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
}

// ── Error handler (must be last) ────────────────────────────────────
app.use(errorHandler);

// ── Start ────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  getDb(); // initialise DB on startup
  console.log(`\n⚡ PPP3 Tracker API running at http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
