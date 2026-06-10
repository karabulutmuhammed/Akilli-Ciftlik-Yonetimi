let ioRef = null;

function setIO(io) {
  ioRef = io;
}

function getIO() {
  return ioRef;
}

function emitDataChanged(entity, action, payload = {}) {
  if (!ioRef) return;
  ioRef.emit("data:changed", {
    entity,
    action,
    at: new Date().toISOString(),
    ...payload
  });
}

module.exports = { setIO, getIO, emitDataChanged };
