const express   = require("express");
const { getDb } = require("../db/database");
const router    = express.Router();

const toTask = (r) => ({
  id:        r.id,
  cat:       r.cat,
  text:      r.text,
  priority:  r.priority,
  status:    r.status,
  targetDay: r.target_day,
  createdAt: r.created_at,
});

// GET /api/tasks?status=active&cat=PPP3
router.get("/", (req, res, next) => {
  try {
    const db  = getDb();
    const { status, cat } = req.query;
    let sql  = "SELECT * FROM tasks WHERE 1=1";
    const params = [];
    if (status) { sql += " AND status = ?"; params.push(status); }
    if (cat)    { sql += " AND cat = ?";    params.push(cat);    }
    sql += " ORDER BY CASE status WHEN 'active' THEN 0 WHEN 'todo' THEN 1 ELSE 2 END, id";
    const rows = db.prepare(sql).all(...params);
    res.json(rows.map(toTask));
  } catch (err) { next(err); }
});

// GET /api/tasks/:id
router.get("/:id", (req, res, next) => {
  try {
    const db  = getDb();
    const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(parseInt(req.params.id));
    if (!row) return res.status(404).json({ error: "Task not found" });
    res.json(toTask(row));
  } catch (err) { next(err); }
});

// POST /api/tasks
// Body: { cat, text, priority?, status?, targetDay? }
router.post("/", (req, res, next) => {
  try {
    const db = getDb();
    const { cat, text, priority = "medium", status = "todo", targetDay = null } = req.body;
    if (!cat || !text) return res.status(400).json({ error: "cat and text are required" });

    const result = db.prepare(`
      INSERT INTO tasks (cat, text, priority, status, target_day)
      VALUES (?, ?, ?, ?, ?)
    `).run(cat, text.trim(), priority, status, targetDay);

    const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(result.lastInsertRowid);
    res.status(201).json(toTask(row));
  } catch (err) { next(err); }
});

// PUT /api/tasks/:id
// Body: partial { cat?, text?, priority?, status?, targetDay? }
router.put("/:id", (req, res, next) => {
  try {
    const db  = getDb();
    const id  = parseInt(req.params.id);
    const row = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    if (!row) return res.status(404).json({ error: "Task not found" });

    const { cat, text, priority, status, targetDay } = req.body;
    db.prepare(`
      UPDATE tasks
      SET cat        = COALESCE(?, cat),
          text       = COALESCE(?, text),
          priority   = COALESCE(?, priority),
          status     = COALESCE(?, status),
          target_day = COALESCE(?, target_day)
      WHERE id = ?
    `).run(cat ?? null, text ?? null, priority ?? null, status ?? null, targetDay ?? null, id);

    const updated = db.prepare("SELECT * FROM tasks WHERE id = ?").get(id);
    res.json(toTask(updated));
  } catch (err) { next(err); }
});

// DELETE /api/tasks/:id
router.delete("/:id", (req, res, next) => {
  try {
    const db = getDb();
    const id = parseInt(req.params.id);
    const result = db.prepare("DELETE FROM tasks WHERE id = ?").run(id);
    if (result.changes === 0) return res.status(404).json({ error: "Task not found" });
    res.json({ deleted: id });
  } catch (err) { next(err); }
});

module.exports = router;
