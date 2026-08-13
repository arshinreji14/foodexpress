const prisma = require("../config/db");

async function getAllMenuItems() {
  return prisma.menuItem.findMany({ orderBy: { id: "asc" } });
}

async function getMenuItemById(id) {
  return prisma.menuItem.findUnique({ where: { id } });
}

module.exports = { getAllMenuItems, getMenuItemById };
