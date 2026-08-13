const express = require("express");
const { placeOrder, getOrder, listAllOrders } = require("../controllers/order.controller");
const { validateCreateOrder } = require("../middleware/validate");
const { requireAuth, optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", optionalAuth, validateCreateOrder, placeOrder);
router.get("/", requireAuth, listAllOrders);
router.get("/:id", optionalAuth, getOrder);

module.exports = router;
