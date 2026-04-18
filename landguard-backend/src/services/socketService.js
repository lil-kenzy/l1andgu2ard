/**
 * socketService.js
 * Centralised Socket.IO helper.
 *
 * call initSocket(io) once from server.js; every other module that needs to
 * emit events imports this file and calls the exposed helpers.
 *
 * Room conventions
 * ────────────────
 *  user-{userId}      – personal room; every authenticated socket joins on connect
 *  admin              – admin/government_admin sockets join automatically
 *  property-{propId}  – per-property room (viewer / buyer joins on demand)
 *
 * Events emitted by the server
 * ─────────────────────────────
 *  property:status-changed  { propertyId, status, title, updatedAt }
 *  property:new-submission  { propertyId, title, submittedAt }        → admin room
 *  notification:new         { …Notification document fields }         → user room
 *  admin:stats-update       { pendingVerifications, … }               → admin room
 */

let _io = null;

/**
 * Initialise the module with the Socket.IO server instance.
 * Must be called once after `io` is created in server.js.
 * @param {import('socket.io').Server} io
 */
function initSocket(io) {
  _io = io;
}

/** @returns {import('socket.io').Server} */
function getIo() {
  if (!_io) throw new Error('socketService not initialised — call initSocket(io) first');
  return _io;
}

/**
 * Emit a property status change event.
 * Goes to:
 *  – property-{propertyId} room (anyone watching the listing)
 *  – admin room (admin panel receives all status changes)
 *
 * @param {string} propertyId
 * @param {'pending'|'verified'|'rejected'|'sold'|'available'} status
 * @param {object} extra   extra fields merged into the payload
 */
function emitPropertyStatusChange(propertyId, status, extra = {}) {
  if (!_io) return;
  const payload = { propertyId: String(propertyId), status, updatedAt: new Date(), ...extra };
  _io.to(`property-${propertyId}`).emit('property:status-changed', payload);
  _io.to('admin').emit('property:status-changed', payload);
}

/**
 * Emit a new property submission event to the admin room.
 * @param {string} propertyId
 * @param {object} extra
 */
function emitNewSubmission(propertyId, extra = {}) {
  if (!_io) return;
  _io.to('admin').emit('property:new-submission', {
    propertyId: String(propertyId),
    submittedAt: new Date(),
    ...extra
  });
}

/**
 * Emit a notification to a single user's personal room.
 * @param {string} userId
 * @param {object} notification  the saved Notification document (or a plain object)
 */
function emitToUser(userId, notification) {
  if (!_io) return;
  _io.to(`user-${userId}`).emit('notification:new', notification);
}

/**
 * Emit an event to all admin sockets.
 * @param {string} event
 * @param {object} data
 */
function emitToAdmins(event, data) {
  if (!_io) return;
  _io.to('admin').emit(event, data);
}

module.exports = {
  initSocket,
  getIo,
  emitPropertyStatusChange,
  emitNewSubmission,
  emitToUser,
  emitToAdmins
};
