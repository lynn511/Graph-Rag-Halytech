// Helpers to persist/retrieve chat sessions per user and agent

const KEY = 'support_hub_sessions';

function readAll() {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(obj) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(obj));
  } catch {
    // ignore
  }
}

export function saveSession(userId, agentType, data) {
  const all = readAll();
  if (!all[userId]) all[userId] = {};
  all[userId][agentType] = data;
  writeAll(all);
}

export function loadSession(userId, agentType) {
  const all = readAll();
  return all?.[userId]?.[agentType] || null;
}


