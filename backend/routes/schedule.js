const express   = require("express");
const { getDb } = require("../db/database");
const router    = express.Router();

// GET /api/schedule/:date
// Returns { scheduleItems: { s1: true, ... }, customTasks: [...] }
router.get("/:date", (req, res, next) => {
  try {
    const db   = getDb();
    const date = req.params.date;

    const schedRows = db.prepare("SELECT item_id, done FROM schedule WHERE date = ?").all(date);
    const schedMap  = Object.fromEntries(schedRows.map(r => [r.item_id, r.done === 1]));

    const customRows = db.prepare(
      "SELECT id, text, done FROM custom_tasks WHERE date = ? ORDER BY id"
    ).all(date);

    res.json({
      date,
      scheduleItems: schedMap,
      customTasks:   customRows.map(r => ({ id: r.id, text: r.text, done: r.done === 1 })),
    });
  } catch (err) { next(err); }
});

// PUT /api/schedule/:date/item
// Body: { itemId: "s1", done: true }
router.put("/:date/item", (req, res, next) => {
  try {
    const db = getDb();
    const { itemId, done } = req.body;
    if (!itemId) return res.status(400).json({ error: "itemId required" });

    db.prepare(`
      INSERT INTO schedule (date, item_id, done) VALUES (?, ?, ?)
      ON CONFLICT(date, item_id) DO UPDATE SET done = excluded.done
    `).run(req.params.date, itemId, done ? 1 : 0);

    res.json({ date: req.params.date, itemId, done: !!done });
  } catch (err) { next(err); }
});

// POST /api/schedule/:date/custom
// Body: { text }
router.post("/:date/custom", (req, res, next) => {
  try {
    const db = getDb();
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: "text required" });

    const result = db.prepare(
      "INSERT INTO custom_tasks (date, text, done) VALUES (?, ?, 0)"
    ).run(req.params.date, text.trim());

    res.status(201).json({ id: result.lastInsertRowid, date: req.params.date, text: text.trim(), done: false });
  } catch (err) { next(err); }
});

// PUT /api/schedule/:date/custom/:id
// Body: { done: true } | { text: "new text" }
router.put("/:date/custom/:id", (req, res, next) => {
  try {
    const db = getDb();
    const id = parseInt(req.params.id);
    const { done, text } = req.body;

    if (done !== undefined) {
      db.prepare("UPDATE custom_tasks SET done = ? WHERE id = ? AND date = ?").run(done ? 1 : 0, id, req.params.date);
    }
    if (text !== undefined) {
      db.prepare("UPDATE custom_tasks SET text = ? WHERE id = ? AND date = ?").run(text.trim(), id, req.params.date);
    }

    const row = db.prepare("SELECT * FROM custom_tasks WHERE id = ?").get(id);
    res.json({ id: row.id, date: row.date, text: row.text, done: row.done === 1 });
  } catch (err) { next(err); }
});

// DELETE /api/schedule/:date/custom/:id
router.delete("/:date/custom/:id", (req, res, next) => {
  try {
    const db = getDb();
    db.prepare("DELETE FROM custom_tasks WHERE id = ? AND date = ?").run(parseInt(req.params.id), req.params.date);
    res.json({ deleted: parseInt(req.params.id) });
  } catch (err) { next(err); }
});

module.exports = router;
