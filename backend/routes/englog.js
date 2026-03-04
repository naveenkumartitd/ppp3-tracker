const express   = require("express");
const { getDb } = require("../db/database");
const router    = express.Router();

const toLog = (r) => r ? ({
  date:      r.date,
  bbc:       r.bbc  === 1,
  anki:      r.anki === 1,
  words:     r.words,
  sentences: r.sentences,
  wordList:  r.word_list,
}) : null;

// GET /api/englog — all history
router.get("/", (req, res, next) => {
  try {
    const db   = getDb();
    const rows = db.prepare("SELECT * FROM eng_log ORDER BY date DESC").all();
    res.json(rows.map(toLog));
  } catch (err) { next(err); }
});

// GET /api/englog/:date
router.get("/:date", (req, res, next) => {
  try {
    const db  = getDb();
    const row = db.prepare("SELECT * FROM eng_log WHERE date = ?").get(req.params.date);
    res.json(toLog(row) || { date: req.params.date, bbc: false, anki: false, words: 0, sentences: 0, wordList: "" });
  } catch (err) { next(err); }
});

// POST /api/englog/:date
router.post("/:date", (req, res, next) => {
  try {
    const db = getDb();
    const { bbc = false, anki = false, words = 0, sentences = 0, wordList = "" } = req.body;
    db.prepare(`
      INSERT INTO eng_log (date, bbc, anki, words, sentences, word_list)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        bbc       = excluded.bbc,
        anki      = excluded.anki,
        words     = excluded.words,
        sentences = excluded.sentences,
        word_list = excluded.word_list
    `).run(req.params.date, bbc ? 1 : 0, anki ? 1 : 0, parseInt(words)||0, parseInt(sentences)||0, wordList);
    const row = db.prepare("SELECT * FROM eng_log WHERE date = ?").get(req.params.date);
    res.json(toLog(row));
  } catch (err) { next(err); }
});

module.exports = router;
