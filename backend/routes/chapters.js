const express   = require("express");
const { getDb } = require("../db/database");
const router    = express.Router();

// GET /api/chapters
// Returns all 21 chapters with user state merged in
router.get("/", (req, res, next) => {
  try {
    const db   = getDb();
    const rows = db.prepare("SELECT * FROM chapters ORDER BY id").all();
    // Map to camelCase for frontend
    const chapters = rows.map(r => ({
      id:            r.id,
      status:        r.status,
      startDate:     r.start_date,
      endDate:       r.end_date,
      exercisesDone: r.exercises_done === 1,
      notes:         r.notes,
    }));
    res.json(chapters);
  } catch (err) { next(err); }
});

// GET /api/chapters/:id
router.get("/:id", (req, res, next) => {
  try {
    const db  = getDb();
    const row = db.prepare("SELECT * FROM chapters WHERE id = ?").get(parseInt(req.params.id));
    if (!row) return res.status(404).json({ error: "Chapter not found" });
    res.json({
      id:            row.id,
      status:        row.status,
      startDate:     row.start_date,
      endDate:       row.end_date,
      exercisesDone: row.exercises_done === 1,
      notes:         row.notes,
    });
  } catch (err) { next(err); }
});

// PUT /api/chapters/:id
// Body: { status?, startDate?, endDate?, exercisesDone?, notes? }
router.put("/:id", (req, res, next) => {
  try {
    const db  = getDb();
    const id  = parseInt(req.params.id);
    const row = db.prepare("SELECT * FROM chapters WHERE id = ?").get(id);
    if (!row) return res.status(404).json({ error: "Chapter not found" });

    const { status, startDate, endDate, exercisesDone, notes } = req.body;

    // Auto-set dates when status changes
    let finalStart = startDate ?? row.start_date;
    let finalEnd   = endDate   ?? row.end_date;
    const today    = new Date().toISOString().split("T")[0];

    if (status === "active" && !finalStart) finalStart = today;
    if (status === "done")   {
      if (!finalStart) finalStart = today;
      if (!finalEnd)   finalEnd   = today;
    }

    db.prepare(`
      UPDATE chapters
      SET status         = COALESCE(?, status),
          start_date     = ?,
          end_date       = ?,
          exercises_done = COALESCE(?, exercises_done),
          notes          = COALESCE(?, notes)
      WHERE id = ?
    `).run(
      status ?? null,
      finalStart,
      finalEnd,
      exercisesDone != null ? (exercisesDone ? 1 : 0) : null,
      notes ?? null,
      id
    );

    const updated = db.prepare("SELECT * FROM chapters WHERE id = ?").get(id);
    res.json({
      id:            updated.id,
      status:        updated.status,
      startDate:     updated.start_date,
      endDate:       updated.end_date,
      exercisesDone: updated.exercises_done === 1,
      notes:         updated.notes,
    });
  } catch (err) { next(err); }
});

module.exports = router;
