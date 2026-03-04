const express = require("express");
const { getDb } = require("../db/database");
const router = express.Router();

const HABIT_IDS = ["ppp3","code","exercise","english","aptitude","sleep","nophone","journal"];

// GET /api/habits/:date
// Returns { date, habits: { ppp3: true, code: false, ... } }
router.get("/:date", (req, res, next) => {
  try {
    const db = getDb();
    const rows = db.prepare("SELECT habit, done FROM habits WHERE date = ?").all(req.params.date);
    const habits = Object.fromEntries(HABIT_IDS.map(h => [h, false]));
    for (const row of rows) habits[row.habit] = row.done === 1;
    res.json({ date: req.params.date, habits });
  } catch (err) { next(err); }
});

// GET /api/habits — last N days (for heatmap)
// Query: ?days=21
router.get("/", (req, res, next) => {
  try {
    const db   = getDb();
    const days = parseInt(req.query.days) || 21;
    const rows = db.prepare(`
      SELECT date, habit, done
      FROM habits
      WHERE date >= date('now', '-' || ? || ' days')
      ORDER BY date DESC
    `).all(days);

    // Group by date
    const grouped = {};
    for (const row of rows) {
      if (!grouped[row.date]) grouped[row.date] = Object.fromEntries(HABIT_IDS.map(h => [h, false]));
      grouped[row.date][row.habit] = row.done === 1;
    }
    res.json(grouped);
  } catch (err) { next(err); }
});

// POST /api/habits/:date
// Body: { habit: "ppp3", done: true }  — upserts a single habit
router.post("/:date", (req, res, next) => {
  try {
    const db = getDb();
    const { habit, done } = req.body;
    if (!HABIT_IDS.includes(habit)) return res.status(400).json({ error: "Unknown habit id" });

    db.prepare(`
      INSERT INTO habits (date, habit, done) VALUES (?, ?, ?)
      ON CONFLICT(date, habit) DO UPDATE SET done = excluded.done
    `).run(req.params.date, habit, done ? 1 : 0);

    res.json({ date: req.params.date, habit, done: !!done });
  } catch (err) { next(err); }
});

module.exports = router;
