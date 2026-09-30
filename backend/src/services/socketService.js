/**
 * Socket.io Real-Time Event Hub
 * Provides synchronized live queue broadcasting and targeted patient alerts.
 */

let io = null;

function initSocket(serverInstance) {
  io = serverInstance;

  io.on('connection', (socket) => {
    // Client can join a specific room or patient channel
    socket.on('join:patient', (patientId) => {
      socket.join(`patient:${patientId}`);
    });

    socket.on('join:room', (roomName) => {
      socket.join(`room:${roomName}`);
    });

    socket.on('disconnect', () => {
      // Clean disconnect
    });
  });

  return io;
}

function getIO() {
  return io;
}

function broadcastQueueUpdate(payload = {}) {
  if (io) {
    io.emit('queue:updated', payload);
  }
}

function notifyPatient(patientId, event, data) {
  if (io) {
    io.to(`patient:${patientId}`).emit(event, data);
    // Also emit globally for staff dashboards
    io.emit(event, { patientId, ...data });
  }
}

module.exports = {
  initSocket,
  getIO,
  broadcastQueueUpdate,
  notifyPatient
};
