const prisma = require("../config/db");
const { ApiError } = require("../middleware/errorHandler");

async function createOrder(userId, { customerName, address, phone, items }) {
  const menuItemIds = items.map((item) => item.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
  });

  const menuItemsById = new Map(menuItems.map((item) => [item.id, item]));

  const missingIds = menuItemIds.filter((id) => !menuItemsById.has(id));
  if (missingIds.length > 0) {
    throw new ApiError(400, `Menu item(s) not found: ${missingIds.join(", ")}`);
  }

  let totalAmount = 0;
  const orderItemsData = items.map((item) => {
    const menuItem = menuItemsById.get(item.menuItemId);
    const priceAtOrder = Number(menuItem.price);
    totalAmount += priceAtOrder * item.quantity;
    return {
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      priceAtOrder,
    };
  });

  const order = await prisma.order.create({
    data: {
      userId,
      customerName,
      address,
      phone,
      totalAmount,
      status: "RECEIVED",
      items: { create: orderItemsData },
    },
    include: { items: { include: { menuItem: true } } },
  });

  return order;
}

async function getOrderById(id, userId) {
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { menuItem: true } } },
  });

  if (!order) {
    return null;
  }

  // Guest orders (userId null) are viewable by anyone with the order id.
  // Orders placed while logged in are only viewable by their owner.
  if (order.userId !== null && order.userId !== userId) {
    return null;
  }

  return order;
}

async function listOrders(userId) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: { include: { menuItem: true } } },
  });
}

async function updateOrderStatus(id, status) {
  return prisma.order.update({
    where: { id },
    data: { status },
  });
}

module.exports = { createOrder, getOrderById, listOrders, updateOrderStatus };
