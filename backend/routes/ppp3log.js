const express   = require("express");
const { getDb } = require("../db/database");
const router    = express.Router();

const toLog = (r) => r ? ({ date: r.date, hours: r.hours, pages: r.pages, note: r.note }) : null;

// GET /api/ppp3log — all entries
router.get("/", (req, res, next) => {
  try {
    const db   = getDb();
    const rows = db.prepare("SELECT * FROM ppp3_log ORDER BY date DESC").all();
    res.json(rows.map(toLog));
  } catch (err) { next(err); }
});

// GET /api/ppp3log/:date
router.get("/:date", (req, res, next) => {
  try {
    const db  = getDb();
    const row = db.prepare("SELECT * FROM ppp3_log WHERE date = ?").get(req.params.date);
    res.json(toLog(row) || { date: req.params.date, hours: 0, pages: 0, note: "" });
  } catch (err) { next(err); }
});

// POST /api/ppp3log/:date
// Body: { hours?, pages?, note? }
router.post("/:date", (req, res, next) => {
  try {
    const db = getDb();
    const { hours = 0, pages = 0, note = "" } = req.body;
    db.prepare(`
      INSERT INTO ppp3_log (date, hours, pages, note) VALUES (?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        hours = excluded.hours,
        pages = excluded.pages,
        note  = excluded.note
    `).run(req.params.date, parseFloat(hours) || 0, parseInt(pages) || 0, note);
    const row = db.prepare("SELECT * FROM ppp3_log WHERE date = ?").get(req.params.date);
    res.json(toLog(row));
  } catch (err) { next(err); }
});

module.exports = router;
