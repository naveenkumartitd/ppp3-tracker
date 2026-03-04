// API client — all requests go through here.
// The Vite proxy forwards /api/* → http://localhost:4000
const BASE = "/api";

async function request(method, path, body) {
  const opts = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

const get  = (path)        => request("GET",    path);
const post = (path, body)  => request("POST",   path, body);
const put  = (path, body)  => request("PUT",    path, body);
const del  = (path)        => request("DELETE", path);

// ── Habits ──────────────────────────────────────────────────────────
export const habitsApi = {
  getDate:  (date)             => get(`/habits/${date}`),
  getRange: (days = 21)        => get(`/habits?days=${days}`),
  toggle:   (date, habit, done) => post(`/habits/${date}`, { habit, done }),
};

// ── Chapters ────────────────────────────────────────────────────────
export const chaptersApi = {
  getAll:  ()               => get(`/chapters`),
  update:  (id, body)       => put(`/chapters/${id}`, body),
};

// ── Tasks ────────────────────────────────────────────────────────────
export const tasksApi = {
  getAll:  (filters = {})   => {
    const q = new URLSearchParams(filters).toString();
    return get(`/tasks${q ? "?" + q : ""}`);
  },
  create:  (body)           => post(`/tasks`, body),
  update:  (id, body)       => put(`/tasks/${id}`, body),
  remove:  (id)             => del(`/tasks/${id}`),
};

// ── Schedule ─────────────────────────────────────────────────────────
export const scheduleApi = {
  getDate:      (date)           => get(`/schedule/${date}`),
  toggleItem:   (date, itemId, done) => put(`/schedule/${date}/item`, { itemId, done }),
  addCustom:    (date, text)     => post(`/schedule/${date}/custom`, { text }),
  toggleCustom: (date, id, done) => put(`/schedule/${date}/custom/${id}`, { done }),
  deleteCustom: (date, id)       => del(`/schedule/${date}/custom/${id}`),
};

// ── PPP3 Log ─────────────────────────────────────────────────────────
export const ppp3Api = {
  getAll:  ()            => get(`/ppp3log`),
  getDate: (date)        => get(`/ppp3log/${date}`),
  save:    (date, body)  => post(`/ppp3log/${date}`, body),
};

// ── English Log ──────────────────────────────────────────────────────
export const engApi = {
  getAll:  ()            => get(`/englog`),
  getDate: (date)        => get(`/englog/${date}`),
  save:    (date, body)  => post(`/englog/${date}`, body),
};

// ── Aptitude Log ─────────────────────────────────────────────────────
export const aptApi = {
  getAll:  ()            => get(`/aptlog`),
  getDate: (date)        => get(`/aptlog/${date}`),
  save:    (date, body)  => post(`/aptlog/${date}`, body),
};

// ── Journal ──────────────────────────────────────────────────────────
export const journalApi = {
  getAll:  ()            => get(`/journal`),
  getDate: (date)        => get(`/journal/${date}`),
  save:    (date, body)  => post(`/journal/${date}`, body),
};
