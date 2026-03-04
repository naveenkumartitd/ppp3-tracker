import { useState, useEffect, useCallback, useRef } from "react";

// ════════════════════════════════════════════════════════════════════
//  STORAGE
// ════════════════════════════════════════════════════════════════════
const STORAGE_KEY = "ppp3tracker_v3";
async function loadAll() {
  try { const r = await window.storage.get(STORAGE_KEY); return r ? JSON.parse(r.value) : null; }
  catch { return null; }
}
async function saveAll(data) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

// ════════════════════════════════════════════════════════════════════
//  HELPERS
// ════════════════════════════════════════════════════════════════════
const toKey = (d) => d.toISOString().split("T")[0];
const TODAY = toKey(new Date());
const daysBetween = (a, b) => Math.floor((new Date(b) - new Date(a)) / 86400000);
const getDayNum = (start) => Math.max(1, daysBetween(start, TODAY) + 1);

const fmtDate = (s) => {
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const fmtShort = (s) => {
  const d = new Date(s + "T00:00:00");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
};
const weekLabel = (s) => new Date(s + "T00:00:00").toLocaleDateString("en", { weekday: "short" });

// ... (file content preserved) ...
