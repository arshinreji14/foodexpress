const orderService = require("../services/order.service");
const { scheduleStatusProgression } = require("../services/orderStatusSimulator");
const { ApiError } = require("../middleware/errorHandler");

async function placeOrder(req, res, next) {
  try {
    const order = await orderService.createOrder(req.userId, req.body);
    scheduleStatusProgression(order.id, req.app.get("io"));
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

async function getOrder(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApiError(400, "Invalid order id");
    }

    const order = await orderService.getOrderById(id, req.userId);
    if (!order) {
      throw new ApiError(404, "Order not found");
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
}

async function listAllOrders(req, res, next) {
  try {
    const orders = await orderService.listOrders(req.userId);
    res.json(orders);
  } catch (err) {
    next(err);
  }
}

module.exports = { placeOrder, getOrder, listAllOrders };
