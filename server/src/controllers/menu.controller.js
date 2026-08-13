const menuService = require("../services/menu.service");
const { ApiError } = require("../middleware/errorHandler");

async function listMenuItems(req, res, next) {
  try {
    const items = await menuService.getAllMenuItems();
    res.json(items);
  } catch (err) {
    next(err);
  }
}

async function getMenuItem(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      throw new ApiError(400, "Invalid menu item id");
    }

    const item = await menuService.getMenuItemById(id);
    if (!item) {
      throw new ApiError(404, "Menu item not found");
    }

    res.json(item);
  } catch (err) {
    next(err);
  }
}

module.exports = { listMenuItems, getMenuItem };
