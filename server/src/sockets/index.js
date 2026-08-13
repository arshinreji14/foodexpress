function initSockets(io) {
  io.on("connection", (socket) => {
    socket.on("joinOrder", (orderId) => {
      socket.join(`order-${orderId}`);
    });

    socket.on("leaveOrder", (orderId) => {
      socket.leave(`order-${orderId}`);
    });
  });
}

module.exports = { initSockets };
