const express   = require("express");
const { getDb } = require("../db/database");
const router    = express.Router();

const toEntry = (r) => r ? ({ date: r.date, did: r.did, learned: r.learned, grateful: r.grateful }) : null;

// GET /api/journal — all entries
router.get("/", (req, res, next) => {
  try {
    const db   = getDb();
    const rows = db.prepare("SELECT * FROM journal ORDER BY date DESC").all();
    res.json(rows.map(toEntry));
  } catch (err) { next(err); }
});

// GET /api/journal/:date
router.get("/:date", (req, res, next) => {
  try {
    const db  = getDb();
    const row = db.prepare("SELECT * FROM journal WHERE date = ?").get(req.params.date);
    res.json(toEntry(row) || { date: req.params.date, did: "", learned: "", grateful: "" });
  } catch (err) { next(err); }
});

// POST /api/journal/:date
router.post("/:date", (req, res, next) => {
  try {
    const db = getDb();
    const { did = "", learned = "", grateful = "" } = req.body;
    db.prepare(`
      INSERT INTO journal (date, did, learned, grateful) VALUES (?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        did      = excluded.did,
        learned  = excluded.learned,
        grateful = excluded.grateful
    `).run(req.params.date, did, learned, grateful);
    const row = db.prepare("SELECT * FROM journal WHERE date = ?").get(req.params.date);
    res.json(toEntry(row));
  } catch (err) { next(err); }
});

module.exports = router;
