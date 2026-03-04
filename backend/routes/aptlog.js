const express   = require("express");
const { getDb } = require("../db/database");
const router    = express.Router();

const toLog = (r) => r ? ({
  date:      r.date,
  topic:     r.topic,
  questions: r.questions,
  correct:   r.correct,
  score:     r.questions > 0 ? Math.round(r.correct / r.questions * 100) : null,
  notes:     r.notes,
}) : null;

// GET /api/aptlog — all history
router.get("/", (req, res, next) => {
  try {
    const db   = getDb();
    const rows = db.prepare("SELECT * FROM apt_log ORDER BY date DESC").all();
    res.json(rows.map(toLog));
  } catch (err) { next(err); }
});

// GET /api/aptlog/:date
router.get("/:date", (req, res, next) => {
  try {
    const db  = getDb();
    const row = db.prepare("SELECT * FROM apt_log WHERE date = ?").get(req.params.date);
    res.json(toLog(row) || { date: req.params.date, topic: "", questions: 0, correct: 0, score: null, notes: "" });
  } catch (err) { next(err); }
});

// POST /api/aptlog/:date
router.post("/:date", (req, res, next) => {
  try {
    const db = getDb();
    const { topic = "", questions = 0, correct = 0, notes = "" } = req.body;
    db.prepare(`
      INSERT INTO apt_log (date, topic, questions, correct, notes)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        topic     = excluded.topic,
        questions = excluded.questions,
        correct   = excluded.correct,
        notes     = excluded.notes
    `).run(req.params.date, topic, parseInt(questions)||0, parseInt(correct)||0, notes);
    const row = db.prepare("SELECT * FROM apt_log WHERE date = ?").get(req.params.date);
    res.json(toLog(row));
  } catch (err) { next(err); }
});

module.exports = router;
