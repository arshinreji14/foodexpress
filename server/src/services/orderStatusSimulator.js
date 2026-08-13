const orderService = require("./order.service");

const STATUS_SCHEDULE = [
  { status: "PREPARING", delayMs: 5000 },
  { status: "OUT_FOR_DELIVERY", delayMs: 15000 },
  { status: "DELIVERED", delayMs: 25000 },
];

function scheduleStatusProgression(orderId, io) {
  STATUS_SCHEDULE.forEach(({ status, delayMs }) => {
    setTimeout(async () => {
      try {
        const updatedOrder = await orderService.updateOrderStatus(orderId, status);
        if (io) {
          io.to(`order-${orderId}`).emit("orderStatusUpdate", {
            orderId,
            status: updatedOrder.status,
          });
        }
      } catch (err) {
        console.error(`Failed to update status for order ${orderId}:`, err.message);
      }
    }, delayMs);
  });
}

module.exports = { scheduleStatusProgression, STATUS_SCHEDULE };
