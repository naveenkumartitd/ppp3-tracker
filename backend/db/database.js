const Database = require("better-sqlite3");
const fs       = require("fs");
const path     = require("path");
require("dotenv").config();

const DB_PATH  = process.env.DB_PATH  || "./ppp3.db";
const START_DATE = process.env.START_DATE || new Date().toISOString().split("T")[0];

let db;

function getDb() {
  if (db) return db;

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");   // faster concurrent reads
  db.pragma("foreign_keys = ON");

  // Run schema
  const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  db.exec(schema);

  // Seed meta row (once)
  db.prepare(`
    INSERT OR IGNORE INTO meta (id, start_date, version)
    VALUES (1, ?, 1)
  `).run(START_DATE);

  // Seed 21 chapters (once)
  const insertChapter = db.prepare(`
    INSERT OR IGNORE INTO chapters (id, status, exercises_done, notes)
    VALUES (?, 'todo', 0, '')
  `);
  for (let i = 1; i <= 21; i++) insertChapter.run(i);

  // Seed initial tasks (once — only if table is empty)
  const taskCount = db.prepare("SELECT COUNT(*) as c FROM tasks").get();
  if (taskCount.c === 0) {
    seedInitialTasks(db);
  }

  return db;
}

function seedInitialTasks(db) {
  const insert = db.prepare(`
    INSERT INTO tasks (cat, text, priority, status, target_day)
    VALUES (@cat, @text, @priority, @status, @targetDay)
  `);
  const tasks = [
    { cat:"PPP3",      text:"Setup VS Code + GCC compiler",                      priority:"high",   status:"todo",   targetDay:1  },
    { cat:"PPP3",      text:"Chapter 1 complete — all exercises done",            priority:"high",   status:"done",   targetDay:3  },
    { cat:"PPP3",      text:"Chapter 2 in progress — Objects, Types, Values",    priority:"high",   status:"active", targetDay:7  },
    { cat:"PPP3",      text:"Chapter 3 — Computation + all exercises",            priority:"high",   status:"todo",   targetDay:12 },
    { cat:"PPP3",      text:"Chapter 4 — Errors (CRITICAL, do not rush)",         priority:"high",   status:"todo",   targetDay:19 },
    { cat:"PPP3",      text:"Build Calculator Project — Ch 5 & 6",               priority:"high",   status:"todo",   targetDay:33 },
    { cat:"PPP3",      text:"Finish Part I — Chapters 1 to 8 complete",           priority:"high",   status:"todo",   targetDay:42 },
    { cat:"PPP3",      text:"Finish Part II — Chapters 9 to 14 complete",        priority:"high",   status:"todo",   targetDay:59 },
    { cat:"PPP3",      text:"Chapter 15 — Pointers and Memory (never rush)",      priority:"high",   status:"todo",   targetDay:64 },
    { cat:"Habits",    text:"Morning walk every day — 20 min minimum",            priority:"high",   status:"todo",   targetDay:1  },
    { cat:"Habits",    text:"Phone grayscale — Settings > Accessibility",         priority:"medium", status:"todo",   targetDay:1  },
    { cat:"Habits",    text:"Install One Sec app for social media control",       priority:"medium", status:"todo",   targetDay:1  },
    { cat:"Habits",    text:"Sleep before 10:00 PM every single night",           priority:"high",   status:"todo",   targetDay:1  },
    { cat:"English",   text:"Bookmark bbclearningenglish.com",                    priority:"medium", status:"todo",   targetDay:1  },
    { cat:"English",   text:"Install Anki — 10 vocabulary words per day",        priority:"medium", status:"todo",   targetDay:2  },
    { cat:"Aptitude",  text:"Create IndiaBix account — indiabix.com",            priority:"medium", status:"todo",   targetDay:1  },
    { cat:"Aptitude",  text:"Complete Priority 1 aptitude topics fully",           priority:"high",   status:"todo",   targetDay:30 },
    { cat:"Community", text:"Join r/learnprogramming on Reddit",                  priority:"low",    status:"todo",   targetDay:7  },
    { cat:"Java",      text:"Master OOP in C++ (Ch 8) before Java class starts",  priority:"high",   status:"todo",   targetDay:70 },
  ];
  const insertMany = db.transaction((rows) => { for (const r of rows) insert.run(r); });
  insertMany(tasks);
}

module.exports = { getDb };
