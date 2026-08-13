const express = require("express");
const { listMenuItems, getMenuItem } = require("../controllers/menu.controller");

const router = express.Router();

router.get("/", listMenuItems);
router.get("/:id", getMenuItem);

module.exports = router;
