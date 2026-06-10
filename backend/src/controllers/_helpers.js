const { getIO } = require("../utils/socket");

function ownerWhere(req, extra = {}) {
  return { userId: req.user.id, ...extra };
}

function emitDataChanged(module, action, payload = {}) {
  try {
    getIO().emit("data:changed", { module, action, ...payload, ts: Date.now() });
  } catch {}
}

function parseFloatOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function parseIntOrNull(value) {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isInteger(num) ? num : null;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

module.exports = { ownerWhere, emitDataChanged, parseFloatOrNull, parseIntOrNull, today };